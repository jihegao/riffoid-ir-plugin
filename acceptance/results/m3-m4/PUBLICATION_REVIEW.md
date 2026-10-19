# 待公开的两个 PR

插件源码位于独立分支 `codex/ir-m3-m4-20261018`，基线为合同提交 `f1f6762e774b5eba63b788a2baacde56d491c0fe`。宿主同名独立分支基于 `240378f65fee54d917b053f565087095a07244db`。两者的完整本地 diff 已准备；宿主完整检查为 3415 Node + 8 Python 通过、13 条件跳过，插件为 25/25。包 SHA 为 `86b7a28a1b92652fb01b15ea6671414ecdd5e38c639878455e7abffb60d46ad6`。

拟公开到 [jihegao/riffoid-ir-plugin](https://github.com/jihegao/riffoid-ir-plugin) 和 [jihegao/riffology-cloud](https://github.com/jihegao/riffology-cloud) 的内容：

- 插件/宿主实现、测试、接入文档及包身份。
- 固定合成 B1、晚5分钟修改、模型/Plan/runtime 原字节及实际运行/独立参考记录。
- 经白名单摘录的本任务可见会话文本和必要四工具调用/结果；移除 thinking、signatures、加密内容、provider 内部字段及 read/bash 输出。完整原件仅留仓库外。
- 历史截图和生成的 simpack 二进制只留本机；公开派生文件和原件 SHA 对应见 [脱敏清单](public-redaction-manifest.json)。

[具体摘录清单与原文件SHA](publication-review.json)。没有测试工作区、auth文件、connection token 或完整原始会话进入公开内容。公开分支已从合同基线重建，含原始会话的旧本地提交不在其祖先链中。

首次公开推送被自动审批拒绝，原因是历史会话可能含敏感内容。本文件把公开目的地和实际范围具体化；用户已明确批准仅公开源码与脱敏 JSON/文本，历史截图保持本机保存。
