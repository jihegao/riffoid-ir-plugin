# 2026-10-19 宿主发布历史归档

Registry 镜像回读、Gateway 发布尝试、维护回执与停止记录已归档至 [riffology-cloud](https://github.com/jihegao/riffology-cloud/blob/6bdf3041ed4cd045c796079edad9a6b93b25b113/evidence/releases/riffoid-ir-m3-m4-20261019/publication-history/README.md)，由宿主仓库维护。来源为本 PR 的固定历史提交 [35de8a1](https://github.com/jihegao/riffoid-ir-plugin/commit/35de8a1c824a547259f4d9dcec2aa29c36c6ccbe)，两份选定文件保持原始字节。

| 材料 | 宿主归档 | Git blob SHA-1 |
| --- | --- | --- |
| 结构化记录 | [JSON](https://github.com/jihegao/riffology-cloud/blob/6bdf3041ed4cd045c796079edad9a6b93b25b113/evidence/releases/riffoid-ir-m3-m4-20261019/publication-history/deployment-progress-20261019.json) | `edbf3103a67d7b56b7bf5a2ca5d62729f604c7fe` |
| 文字记录 | [文本](https://github.com/jihegao/riffology-cloud/blob/6bdf3041ed4cd045c796079edad9a6b93b25b113/evidence/releases/riffoid-ir-m3-m4-20261019/publication-history/deployment-progress-20261019.txt) | `0fbfa445aad02087d3115d4f104f2813dad2168f` |

这些记录覆盖 2026-10-19 的历史观察：累计两次 Gateway PUT、零新成功 ACK、零 app rollout，Riffoid ACC 尚未开始，合同 M3/M4 尚未完成。归档日期不构成新的运行或部署证据。

后续 2026-10-28 的实际发布、503 修复与维护解除见[宿主发布恢复报告](https://github.com/jihegao/riffology-cloud/blob/6bdf3041ed4cd045c796079edad9a6b93b25b113/docs/project-view-ir-publication-recovery-20261028.md#entry-replay-repair-and-service-restoration)。当前交付阶段和剩余验收以[宿主发布索引](https://github.com/jihegao/riffology-cloud/blob/main/docs/release-readiness.md)及 [riffology-cloud #254](https://github.com/jihegao/riffology-cloud/issues/254)最新证据为准。

本库保留插件的[双端验收记录](acceptance.json)、[PiWeb/riff-pi 清单](pi-web/manifest.json)与本归档引用。Compiler 的 IR 转换、仿真业务语义和 GC 回归证据由 `sim_engine_compiler` 维护；本次宿主发布历史归档不增加仿真验证结论。
