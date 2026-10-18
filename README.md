# Riffoid IR Plugin

在本地 pi-web 和 Riffoid 线上 pi-agent 中，用同一套共享逻辑完成自然语言建模、Business IR 检查与编译、用户浏览器运行、结果解释和修改后重跑。

**当前处于文档阶段，尚未提供可运行的插件实现。首版开发与验收只以 v0.2 功能需求合同为准。**

## 开发入口（唯一依据）

- [功能需求与开发合同 v0.2](docs/functional-requirements-v0.2.md)：首版范围、8 项功能需求、4 个工具、双宿主接入、5 项验收和交付顺序。命令只有 `/sim ir`、`/sim code`、`/sim show`。
- [固定 B1 模型](acceptance/b1/business-ir.json)与[验收预期](acceptance/b1/expected.json)：首个确定性闭环、单字段修改和独立预期来源；实际运行证据由实现阶段交付。

首版交付单位是：**一个共享包、两个宿主接入、一个确定性案例及一次有效修改。**

- **pi-web**：该共享包作为可安装的 Pi extension 加载。
- **Riffoid**：受控 Pi 没有 extension 加载。同一套共享逻辑经 fixedSkills 与 `project_*` 工具桥装配，不是 Pi extension 安装。项目隔离域内的原生插件是后续方向（[JHG-50](https://linear.app/jhgao/issue/JHG-50)），不进入首版。

复用现有编译器和宿主文件机制，先接通浏览器执行与结果回传。

## 不要当作首版实现

- [v0.1 使用指南说明](riffoid-ir-plugin-usage-guide-v0.1.md)只指向[历史原稿](docs/history/riffoid-ir-plugin-usage-guide-v0.1.md)。原稿里的 `/model`、任务偏好和订阅不是首版命令或范围。
- 以 `/model` 和平台发布能力为中心的功能需求草稿（约 68 条）不在本仓库中，已被 v0.2 取代。
- `ir-plugin-design-deep-dive.md` 与 `ir-plugin-guide-review.md` 不是本仓库文件，不能当作仍在维护的输入。
- [复杂系统建模与仿真白皮书（中文精炼版）](复杂系统建模与仿真白皮书_精炼版_中文.md)：长期架构与领域扩展方向，不增加首版验收。
