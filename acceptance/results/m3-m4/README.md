# M3/M4 当前轮次证据

合同基线为 `f1f6762e774b5eba63b788a2baacde56d491c0fe`；共享包为 `0.3.1`。本目录只保留验收所需的选定证据。测试工作区、完整原始日志、会话目录和打包制品均位于仓库外。

- [包身份与逐文件 SHA](package-pin.json)：同一源代码两次打包逐字节相同，宿主两个 vendor 路径和独立 Pi Web 实例使用该包。
- [准备阶段记录](preparation.json)、[插件完整检查](plugin-check.txt)：25/25 通过，使用现有真实 CompilerSDK。
- 本快照尚未记录当前包的两端实际 ACC。历史 `../pi-web/` 的 0.2.x 结果仍为历史证据，不替代本轮验收。

部署、真实会话、运行记录、独立参考结果和最终 ACC 对照在执行后追加；没有实际结果的项目保持 pending。宿主范围及集成基线见 [riffology-cloud#254](https://github.com/jihegao/riffology-cloud/issues/254)。

公开内容按用户选择限源码和脱敏 JSON/文本；历史截图、完整会话与生成的 simpack 二进制保留本机。历史文档中的截图/二进制引用需在保留原件的本机查看。路径脱敏派生文件及原件 SHA 对应见[清单](public-redaction-manifest.json)；冻结模型和运行时字节没有改写。

本轮 Pi Web 的 ACC-01～05 与 riff-pi 已实际通过：[双端验收记录](acceptance.json)、[自然对话/生成阶段/运行与独立参考的公开清单](pi-web/manifest.json)、[边界与一次生成阶段干预说明](pi-web/README.txt)。Riffoid 线上仍为 pending；本地验收不代替 M3 完成定义。
