// Restricted aircraft daily-support Plan interpreter. No Business JSON or
// expected-result fixtures are imported by the execution path.
export const RUNTIME_VERSION = 'aircraft-b1-browser/0.2.0';
export const PHASES = ['transport_arrivals', 'mission_returns', 'job_progress_and_completions', 'failures',
  'operations_postflight_before_preparation', 'preventive_generation', 'preflight_generation', 'resource_dispatch',
  'mission_dispatch', 'operations_postflight_after_dispatch', 'mission_success', 'daily_readiness',
  'operational_availability', 'downtime', 'stop'];

export function planDiagnostics(plan) {
  const diagnostics = [];
  const reject = (path, message) => diagnostics.push({ code: 'unsupported_browser_plan', stage: 'browser-capability', path, message });
  if (!plan || typeof plan !== 'object') { reject('plan', 'Plan object required'); return diagnostics; }
  for (const [key, expected] of Object.entries({ plan_version: 'aircraft-support-plan/v1alpha2', domain: 'aircraft-support',
    semantic_profile: 'legacy-minute-v1', rng_profile: 'legacy-sequential-v1', work_policy: 'stable-topological-serial' })) {
    if (plan[key] !== expected) reject(`plan.${key}`, `Requires ${expected}`);
  }
  if (JSON.stringify(plan.phases) !== JSON.stringify(PHASES)) reject('plan.phases', 'Exact legacy minute phase ordering required');
  if (!Number.isInteger(plan.duration_minutes) || plan.duration_minutes < 1 || plan.duration_minutes >= 1440) reject('plan.duration_minutes', 'Single-day horizon in [1,1439] required');
  if (plan.natural_completion_enabled) reject('plan.natural_completion_enabled', 'Only duration stop is supported');
  for (const key of ['unsupported_features', 'preventive_cycles', 'supply_routes']) {
    if (!Array.isArray(plan[key]) || plan[key].length) reject(`plan.${key}`, 'This capability is outside the deterministic daily-support subset');
  }
  if (plan.resource_dispatch_index) reject('plan.resource_dispatch_index', 'Indexed dispatch is unsupported');
  for (const key of ['aircraft', 'missions', 'activities', 'resource_nodes', 'components']) {
    if (!Array.isArray(plan[key]) || !plan[key].length || plan[key].length > 100) reject(`plan.${key}`, 'Requires 1–100 entries');
  }
  if (diagnostics.length) return diagnostics;
  plan.aircraft.forEach((item, i) => {
    if (item.index !== i || item.initial_state !== 'available') reject(`plan.aircraft[${i}]`, 'Contiguous indexes and available initial state required');
  });
  plan.components.forEach((item, i) => {
    if (item.failure_rate_per_hour !== 0 || item.repair_activity_index !== -1) reject(`plan.components[${i}]`, 'Failures and repair are unsupported');
  });
  plan.resource_nodes.forEach((item, i) => {
    if (item.index !== i || item.inventory.length || ![item.personnel_capacity, item.equipment_capacity].every(x => Number.isInteger(x) && x >= 0 && x <= 1000)) {
      reject(`plan.resource_nodes[${i}]`, 'Bounded integer capacities without inventory required');
    }
  });
  const matches = (a, model) => !model || [a.model, a.aircraft_type].includes(model);
  plan.missions.forEach((item, i) => {
    if (item.index !== i || !item.operations_plan_group_id || item.required_aircraft !== 1 || item.min_required_aircraft !== 1
      || ![item.planned_start, item.preparation_start, item.duration_minutes, item.cancel_minutes, item.priority].every(Number.isInteger)
      || item.preparation_start < 0 || item.preparation_start > item.planned_start || item.planned_start < 1 || item.planned_start >= 1440
      || item.duration_minutes < 1 || item.duration_minutes > 1439 || item.cancel_minutes < 0 || item.success_point < 0 || item.success_point > 1) {
      reject(`plan.missions[${i}]`, 'Single-aircraft deterministic missions with valid integer minute timing required');
    }
    for (const aircraft of plan.aircraft.filter(a => matches(a, item.required_aircraft_type))) {
      for (const phase of ['preflight', 'relaunch', 'postflight']) {
        if (plan.activities.filter(a => a.plan_group_id === item.operations_plan_group_id && a.phase === phase && matches(aircraft, a.aircraft_model)).length !== 1) {
          reject(`plan.missions[${i}]`, `Exactly one compatible ${phase} activity required`);
        }
      }
    }
  });
  plan.activities.forEach((item, i) => {
    if (item.index !== i || !['preflight', 'relaunch', 'postflight'].includes(item.phase) || item.kind !== item.phase
      || !plan.resource_nodes[item.resource_node_index] || item.steps.length > 100 || item.maintenance_methods.length) {
      reject(`plan.activities[${i}]`, 'Only bounded serial daily-support activities are supported');
    }
    item.steps.forEach((step, j) => {
      if (step.index !== j || step.spares.length || ![step.duration_minutes, step.personnel, step.equipment].every(x => Number.isInteger(x) && x >= 0 && x <= 1439)) {
        reject(`plan.activities[${i}].steps[${j}]`, 'Nonnegative integer serial durations/resources without spares required');
      }
    });
  });
  return diagnostics;
}

export function executePlan(plan, { seed = 0 } = {}) {
  const diagnostics = planDiagnostics(plan);
  if (!Number.isSafeInteger(seed) || seed < 0) diagnostics.push({ code: 'invalid_seed', stage: 'run', message: 'seed must be a nonnegative safe integer' });
  if (diagnostics.length) throw Object.assign(new Error(diagnostics[0].message), { diagnostics });
  // Mutability belongs exclusively to RunState; the compiled Plan is read-only.
  const aircraft = plan.aircraft.map(a => ({ ...a, state: a.initial_state, prepared: new Set(), current: null,
    returnTime: null, operationsDay: null, dailyTakeoffs: 0, group: '', lastMission: null, postflightRequired: false, postflightDue: false }));
  const missions = plan.missions.map(() => ({ status: 'scheduled', assigned: [], actualStart: null, delay: 0, successEvaluated: false, succeeded: false }));
  const resources = plan.resource_nodes.map(() => ({ personnel: 0, equipment: 0 }));
  const jobs = [];
  const events = [];
  const delayed = new Set();
  let minute = 0, phase = 'initialize', launched = 0, completed = 0, cancelled = 0;
  const matches = (a, model) => !model || [a.model, a.aircraft_type].includes(model);
  const missionId = i => i === null ? null : plan.missions[i].mission_id;
  const emit = (kind, rule_id, entity, details = {}, source_path = null) => {
    const mappedMission = plan.missions.find(m => m.mission_id === (details.mission_id || entity));
    const mappedActivity = plan.activities.find(a => a.activity_id === details.activity_id);
    events.push({ sequence: events.length + 1, time: minute, phase, kind, rule_id, entity,
      source_path: source_path || mappedActivity?.source_path || mappedMission?.source_path || null, details });
  };
  const activityFor = (a, group, kind) => plan.activities.find(x => x.plan_group_id === group && x.phase === kind && matches(a, x.aircraft_model));
  function completeJob(job) {
    const a = aircraft[job.aircraft], activity = plan.activities[job.activity];
    job.state = 'completed';
    emit('operations_phase_completed', 'daily-v1.complete-operation', job.id, { tail_number: a.tail_number,
      mission_id: missionId(job.mission), activity_id: activity.activity_id, operations_phase: activity.phase });
    if (job.kind === 'preflight') {
      a.prepared.add(job.mission); a.current = job.mission; a.state = 'mission_ready';
      emit('preflight_completed', 'mission.preflight-complete', a.tail_number, { mission_id: missionId(job.mission) });
    } else {
      a.state = 'available'; a.postflightRequired = false; a.postflightDue = false;
      emit('postflight_completed', 'daily-v1.postflight-complete', a.tail_number);
    }
  }
  function createJob(ai, activity, kind, mi) {
    const job = { id: `job-${String(jobs.length + 1).padStart(4, '0')}`, aircraft: ai, activity: activity.index, kind,
      mission: mi, state: 'waiting', step: 0, remaining: 0, started: null };
    jobs.push(job);
    emit('operations_phase_created', 'daily-v1.create-operation', job.id, { tail_number: aircraft[ai].tail_number,
      mission_id: missionId(mi), activity_id: activity.activity_id, operations_phase: activity.phase });
    if (!activity.steps.length) { job.started = minute; completeJob(job); }
  }
  const ready = (a, mi) => a.prepared.has(mi) && ((a.state === 'mission_ready' && a.current === mi)
    || (a.state === 'available' && (a.current === null || a.current === mi)));
  const commissioned = mi => new Set([
    ...jobs.filter(j => j.kind === 'preflight' && j.mission === mi && ['waiting', 'running'].includes(j.state)).map(j => j.aircraft),
    ...aircraft.flatMap((a, ai) => ready(a, mi) && matches(a, plan.missions[mi].required_aircraft_type) ? [ai] : []),
  ]).size;
  const release = job => {
    const activity = plan.activities[job.activity], step = activity.steps[job.step], r = resources[activity.resource_node_index];
    r.personnel -= step.personnel; r.equipment -= step.equipment;
  };
  function postflight(cutoff = false) {
    aircraft.forEach((a, ai) => {
      if (a.operationsDay === null || !a.dailyTakeoffs) return;
      if (cutoff && (a.postflightRequired || a.state === 'flying')) a.postflightDue = true;
      if (!a.postflightRequired) return;
      const remaining = plan.missions.some((m, mi) => ['scheduled', 'delayed'].includes(missions[mi].status)
        && Math.floor(Math.max(minute, m.planned_start) / 1440) === a.operationsDay
        && minute <= m.planned_start + m.cancel_minutes && matches(a, m.required_aircraft_type)
        && (a.current === mi || commissioned(mi) < m.required_aircraft));
      if (!remaining) a.postflightDue = true;
      if (a.postflightDue && !['flying', 'post_support'].includes(a.state)) {
        a.state = 'post_support'; createJob(ai, activityFor(a, a.group, 'postflight'), 'postflight', a.lastMission);
      }
    });
  }
  const handlers = {
    mission_returns() {
      aircraft.forEach(a => {
        if (a.state !== 'flying' || a.returnTime > minute) return;
        const mi = a.current, m = missions[mi];
        a.state = 'available'; a.current = null; a.returnTime = null; a.postflightRequired = true;
        completed += 1;
        if (m.assigned.every(ai => aircraft[ai].state !== 'flying')) m.status = 'completed';
        emit('mission_returned', 'mission.return', a.tail_number, { mission_id: missionId(mi) });
      });
    },
    job_progress_and_completions() {
      for (const job of jobs) {
        if (job.state !== 'running' || --job.remaining > 0) continue;
        const step = plan.activities[job.activity].steps[job.step];
        release(job);
        emit('operations_step_completed', 'work.serial-step-complete', job.id, { step_index: step.index, activity_code: step.code });
        if (++job.step === plan.activities[job.activity].steps.length) completeJob(job);
        else job.state = 'waiting';
      }
    },
    operations_postflight_before_preparation: () => postflight(),
    operations_postflight_after_dispatch: () => postflight(),
    preflight_generation() {
      plan.missions.forEach((m, mi) => {
        if (!['scheduled', 'delayed'].includes(missions[mi].status) || minute < m.preparation_start || commissioned(mi) >= m.required_aircraft) return;
        let created = 0;
        for (let ai = 0; ai < aircraft.length && commissioned(mi) < m.required_aircraft; ai++) {
          const a = aircraft[ai];
          if (a.state !== 'available' || a.postflightDue || a.prepared.size || !matches(a, m.required_aircraft_type)) continue;
          a.state = 'pre_support'; a.current = mi;
          const kind = a.operationsDay === Math.floor(Math.max(minute, m.planned_start) / 1440) && a.dailyTakeoffs ? 'relaunch' : 'preflight';
          createJob(ai, activityFor(a, m.operations_plan_group_id, kind), 'preflight', mi); created++;
        }
        if (created) emit('preflight_created', 'mission.commission-preflight', m.mission_id, { created });
      });
    },
    resource_dispatch() {
      const waiting = jobs.filter(j => j.state === 'waiting').sort((a, b) => plan.activities[a.activity].priority - plan.activities[b.activity].priority
        || (a.started ?? minute) - (b.started ?? minute) || a.id.localeCompare(b.id));
      for (const job of waiting) {
        const activity = plan.activities[job.activity], step = activity.steps[job.step];
        const spec = plan.resource_nodes[activity.resource_node_index], r = resources[activity.resource_node_index];
        if (r.personnel + step.personnel > spec.personnel_capacity || r.equipment + step.equipment > spec.equipment_capacity) continue;
        r.personnel += step.personnel; r.equipment += step.equipment;
        job.state = 'running'; job.remaining = step.duration_minutes; job.started ??= minute;
        emit('operations_step_started', 'work.serial-step-start', job.id, { step_index: step.index, activity_code: step.code });
      }
    },
    mission_dispatch() {
      plan.missions.forEach((m, mi) => {
        const state = missions[mi];
        if (!['scheduled', 'delayed'].includes(state.status) || minute < m.planned_start) return;
        const ai = aircraft.findIndex(a => ready(a, mi) && matches(a, m.required_aircraft_type));
        if (ai >= 0) {
          const a = aircraft[ai];
          a.state = 'flying'; a.current = mi; a.prepared.delete(mi); a.returnTime = minute + m.duration_minutes;
          a.operationsDay = Math.floor(minute / 1440); a.dailyTakeoffs++; a.group = m.operations_plan_group_id; a.lastMission = mi;
          state.status = 'launched'; state.actualStart = minute; state.assigned = [ai]; state.delay = minute - m.planned_start;
          if (state.delay) delayed.add(mi);
          launched++;
          emit('mission_launched', 'mission.dispatch-ready-aircraft', m.mission_id, { aircraft: [a.tail_number] });
        } else if (minute - m.planned_start >= m.cancel_minutes) {
          state.status = 'cancelled'; cancelled++;
          jobs.filter(j => j.kind === 'preflight' && j.mission === mi && ['waiting', 'running'].includes(j.state)).forEach(j => {
            if (j.state === 'running') release(j); j.state = 'cancelled';
          });
          aircraft.forEach(a => { if (a.current === mi && ['pre_support', 'mission_ready'].includes(a.state)) { a.state = 'available'; a.current = null; } a.prepared.delete(mi); });
          emit('mission_cancelled', 'mission.cancel-insufficient-ready-aircraft', m.mission_id);
        } else { state.status = 'delayed'; delayed.add(mi); }
      });
    },
    mission_success() {
      plan.missions.forEach((m, mi) => {
        const state = missions[mi];
        if (state.successEvaluated || (state.actualStart ?? m.planned_start) + Math.ceil(m.duration_minutes * m.success_point) > minute) return;
        state.successEvaluated = true; state.succeeded = state.assigned.length >= m.min_required_aircraft;
        emit(state.succeeded ? 'mission_success_point_succeeded' : 'mission_success_point_failed', 'mission.evaluate-success-point', m.mission_id, { members: state.assigned.length });
      });
    },
    stop() { if (minute === plan.duration_minutes) { postflight(true); emit('simulation_stopped', 'stop.duration', 'simulation'); } },
  };
  for (minute = 1; minute <= plan.duration_minutes; minute++) {
    for (phase of plan.phases) handlers[phase]?.();
  }
  const executable = plan.missions.filter(m => m.planned_start <= plan.duration_minutes);
  return { runtimeVersion: RUNTIME_VERSION, planFingerprint: plan.fingerprint, seed, stopReason: 'duration',
    metrics: { planned_sorties: executable.reduce((n, m) => n + m.required_aircraft, 0), launched_sorties: launched,
      completed_sorties: completed, successful_mission_waves: missions.filter((s, i) => s.succeeded && plan.missions[i].planned_start <= plan.duration_minutes).length,
      cancelled_sorties: cancelled, delayed_sorties: delayed.size, elapsed_minutes: plan.duration_minutes },
    events, terminalState: { aircraft: aircraft.map(a => ({ tail_number: a.tail_number, state: a.state, daily_takeoffs: a.dailyTakeoffs,
      postflight_required: a.postflightRequired })), resources: resources.map((r, i) => ({ node_id: plan.resource_nodes[i].node_id,
      personnel_in_use: r.personnel, equipment_in_use: r.equipment, inventory: {} })) } };
}
