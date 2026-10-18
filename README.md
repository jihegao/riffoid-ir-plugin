# Riffoid IR Plugin

在本地 pi-web 和 Riffoid 线上 pi-agent 中，用同一套插件完成自然语言建模、Business IR 检查与编译、用户浏览器运行、结果解释和修改后重跑。

**当前处于文档阶段，尚未提供可安装的插件实现。首版开发与验收以 v0.2 功能需求合同为准。**

## 开发入口

- [功能需求与开发合同 v0.2](docs/functional-requirements-v0.2.md)：首版范围、8 项功能需求、4 个工具、双宿主接入、5 项验收和交付顺序。
- [固定 B1 模型](acceptance/b1/business-ir.json)与[验收预期](acceptance/b1/expected.json)：首个确定性闭环、单字段修改和独立预期来源；实际运行证据由实现阶段交付。

首版交付单位是：**一个共享包、两个宿主接入、一个确定性案例及一次有效修改。** 复用现有编译器和宿主文件机制，先接通浏览器执行与结果回传。

## 设计参考

- [复杂系统建模与仿真白皮书（中文精炼版）](复杂系统建模与仿真白皮书_精炼版_中文.md)：长期架构与领域扩展方向。
- [Riffoid 多层 IR Plugin 使用指南 v0.1](riffoid-ir-plugin-usage-guide-v0.1.md)：历史使用设计。首版命令采用合同中的 `/sim ir`、`/sim code`、`/sim show`；原指南中的 `/model`、任务偏好和订阅等不作为首版承诺。
