本目录是 riffoid-ir-plugin 0.3.1 本轮实际 PiWeb 验收的公开 JSON/文本暂存集。

固定包 SHA256: 86b7a28a1b92652fb01b15ea6671414ecdd5e38c639878455e7abffb60d46ad6
范围：独立 PiWeb 实例中的两次自然 Session，以及一次实际 riff-pi Direct Browser 验收；本目录不声称已经完成 Riffoid 线上端验收。

透明说明与缺口：
1. 首次 generate-only 提示中的“同步展示”导致 Agent 额外探索源码；操作方追加了一次 steer，要求只写 B1 草稿、展示摘要并停止。这不是无干预一遍通过。原始 visible 用户提示和 steer 均保留在 generation 与 natural/sessions 的白名单摘录中；原始完整会话仅本机保留。生成终态前缀与后续执行请求已区分，前缀中四工具和 records 调用均为零。
2. 此后 baseline 的四工具链、坏 JSON 定位/修复与单字段改为 00:45 的 variant，以及重开同项目和第二 Session 通过 sourceRunId 原条件复跑，均来自实际工具记录和真实浏览器保存的结果。第二 Session 没有重新检查或编译，当前草稿仍为 00:45。
3. 独立 Python Compiler SDK reference 对齐合同七项指标、停止原因和指定事件顺序。浏览器保留 22 个事件，完整 SDK reference 保留 26 个事件；没有声称跨引擎内部全轨迹逐项相等。浏览器的 sourceRunId 复跑则与来源运行的输入、冻结引用、指标和事件完全相同。
4. riff-pi 脚本实际创建三条浏览器运行，检查语法修复、baseline/variant、重开复跑和缺 repair 能力诊断；完成后五个模型文件逐字节恢复，三个自然运行目录和两个 Session 字节均保持不变。
5. 四张操作方截图、所有 simpack 二进制、原始会话、原始 observation 与模型备份留本机。private-file-manifest.json 只记录其大小、SHA256 和说明。公开 observation 使用独立脱敏副本。

文件与绑定：
- identity.json 给出包、编译器、运行时与六条运行身份。runs 各子目录中的 evidence.json 指向按 SHA256 去重的 graphs JSON。
- 冻结 Business/Plan/artifact/reference JSON 在本轮均可原字节公开。其 SHA256 与原始绑定保持不变；没有为脱敏改写冻结图或其指纹。record 是省略临时执行者标识的公开派生副本，清单同时保留原 record 的 SHA256/字节数。
- manifest.json 对除自身和校验文本外的公开文件列出字节数、SHA256、原始来源摘要与是否派生。MANIFEST-SHA256.txt 给出 manifest 本身的 SHA256。

声明的本机路径占位符：
[ACCEPTANCE_WORKSPACE] 测试项目工作区；[CANDIDATE_PACKAGE] 固定包解压目录；[CANDIDATE_ROOT] 独立实例目录；[PLUGIN_WORKTREE] 插件独立 worktree；[PLUGIN_SOURCE_ROOT] 原始插件源码；[RIFF_PI_SOURCE] riff-pi 源码；[EVIDENCE_HOME] 外部验收目录；[PI_WEB_INSTALLATION] PiWeb 安装目录；[TEMP_ROOT] 本机临时目录；[LOCAL_PATH]/[LOCAL_TEMP_PATH]/[LOCAL_TOOLCHAIN] 其他本机路径；[LOCAL_SERVICE]/[LOCAL_EXECUTOR]/[PRIVATE_EXECUTOR_VALUE] 已移除的本机连接信息。没有在公开文件中给出这些占位符对应的绝对路径。
