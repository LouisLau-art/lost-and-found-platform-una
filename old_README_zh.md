# 校园失物招领平台 (Campus Lost & Found Platform)

[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-409EFF?style=flat&logo=element&logoColor=white)](https://element-plus.org/)

一个基于现代Web技术栈构建的智能校园失物招领平台，提供高效的物品匹配、用户交互和社区功能。

## 📌 项目概述

本项目是一个面向校园环境的失物招领平台，旨在通过技术手段提高失物招领的效率和用户体验。平台采用前后端分离架构，后端基于Python FastAPI框架，前端使用Vue 3构建，数据库采用MySQL（开发和生产环境）。

## ✨ 主要功能

### 核心功能
- **用户认证**：支持邮箱/密码注册与登录，JWT令牌认证
- **用户管理**：个人资料管理、通知系统和信用评分系统
- **社区论坛**：发布帖子、评论互动、点赞收藏
- **实时通知**：基于WebSocket的实时通知，评论和认领状态变更提醒
- **邮件通知**：认领状态变更的自动化邮件通知
- **响应式设计**：适配桌面和移动端的现代化UI界面

### 失物招领特色功能
- **智能分类**：支持多种物品分类（电子设备、证件、钥匙等）
- **智能匹配**：基于内容的推荐系统，自动匹配失物与招领信息
- **多图上传**：支持多张图片上传，展示物品详情
- **高级搜索**：按分类、地点、时间、状态等多维度筛选
- **认领系统**：完整的认领流程，包括申请、审核、确认
- **互评系统**：物品所有人与认领人之间的相互评价
- **信用积分**：基于用户行为的信用评分系统
- **详细信息**：记录物品位置、时间、联系方式等关键信息

## 🚀 技术栈

### 后端技术
- **FastAPI**：高性能Python Web框架，自动生成API文档
- **SQLModel**：结合SQLAlchemy和Pydantic的类型安全ORM
- **MySQL**：可靠的关系型数据库，适用于开发和生产环境
- **JWT**：基于JSON Web Token的认证机制
- **Alembic**：数据库迁移工具
- **Uvicorn**：ASGI服务器，支持异步请求处理
- **Scikit-learn**：用于智能匹配算法
- **Python-Levenshtein**：字符串相似度计算

### 前端技术
- **Vue 3**：渐进式JavaScript框架，采用Composition API
- **Pinia**：Vue的现代化状态管理库
- **Vue Router**：Vue.js官方路由管理器
- **Axios**：基于Promise的HTTP客户端
- **Element Plus**：基于Vue 3的桌面端组件库
- **Tailwind CSS**：实用优先的CSS框架
- **Vite**：下一代前端构建工具
- **Day.js**：轻量级日期处理库

## 📁 项目结构

```
lost-and-found-platform/
├── backend/                 # 后端代码
│   ├── app/                # 应用主目录
│   │   ├── api/            # API路由
│   │   │   ├── v1/         # API版本1
│   │   │   └── deps.py     # 依赖注入
│   │   ├── core/           # 核心功能
│   │   │   ├── config.py   # 配置管理
│   │   │   └── security.py # 安全相关
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # Pydantic模型
│   │   └── services/       # 业务逻辑
│   ├── tests/              # 测试代码
│   ├── alembic/            # 数据库迁移
│   ├── scripts/            # 实用脚本
│   ├── requirements.txt     # Python依赖
│   └── start.py            # 启动脚本
│
└── frontend/               # 前端代码
    └── frontend/           # Vue项目
        ├── public/         # 静态资源
        └── src/
            ├── api/        # API请求
            ├── assets/     # 资源文件
            ├── components/ # 公共组件
            ├── router/     # 路由配置
            ├── stores/     # Pinia状态管理
            ├── utils/      # 工具函数
            └── views/      # 页面组件
```

## 🔄 最近更新

### 前端优化 (2024-01-15)
- 统一使用`content-wrapper`包装主要视图，确保一致的页面布局
- 创建`message`工具函数，统一管理消息提示
- 优化通知中心，使用`router-link`实现页面跳转
- 修复了多个视图中的消息提示和布局问题

### 数据库优化 (2024-01-10)
- 优化了数据库查询性能
- 添加了数据库备份和恢复脚本
- 修复了数据一致性问题

## 🚧 开发进展

### 已完成功能
- [x] 用户认证（注册、登录、JWT）
- [x] 物品发布与管理
- [x] 图片上传与展示
- [x] 认领流程实现
- [x] 用户评价系统
- [x] 通知系统
- [x] 响应式布局

### 进行中
- [ ] 智能推荐算法优化
- [ ] 后台管理系统
- [ ] 数据统计与分析
- [ ] 多语言支持

## 🛠️ 开发指南

### 环境要求
- Python 3.9+
- Node.js 18+
- MySQL 8.0+

### 快速开始

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/lost-and-found-platform.git
   cd lost-and-found-platform
   ```

2. **后端设置**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # 或 venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

3. **前端设置**
   ```bash
   cd ../frontend/frontend
   npm install
   ```

4. **启动开发服务器**
   ```bash
   # 启动后端
   cd ../../backend
   uvicorn app.main:app --reload

   # 启动前端 (新终端)
   cd ../frontend/frontend
   npm run dev
   ```

5. 访问 `http://localhost:5173`

## 🤝 贡献指南

欢迎提交Issue和Pull Request。请确保：
1. 遵循项目的代码风格
2. 添加适当的测试
3. 更新相关文档

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)

## 📞 联系方式

如有任何问题或建议，请通过以下方式联系我们：
- 邮箱：your.email@example.com
- GitHub Issues: [提交问题](https://github.com/yourusername/lost-and-found-platform/issues)

## 数据库架构

应用程序使用以下主要实体：

- **用户**：具有认证、个人资料信息和信用分数的用户账户
- **分类**：物品分类（电子设备、证件、钥匙、书籍等）
- **帖子**：包含失物/招领物品信息的论坛帖子
- **评论**：帖子的评论
- **通知**：用户的系统通知
- **认领** ✨：失物招领物品的认领请求
- **评价** ✨：成功认领后的用户评价

## 管理员设置

要创建管理员账户，请运行管理员创建脚本：

```bash
cd backend
source .venv/bin/activate  # 激活虚拟环境
python3 create_admin.py
```

脚本将提示您输入：
- 用户名
- 全名
- 邮箱
- 密码（最少6个字符）

创建后，您可以使用这些凭据登录并访问管理员功能，包括：
- 用户管理（`/admin/users`）
- 帖子审核（`/admin/posts`）
- 系统范围的内容管理

## 开发

### 运行测试

```bash
# 后端测试
cd backend
pytest

# 前端测试
cd frontend/frontend
npm run test
```

### 数据库迁移

```bash
cd backend
alembic upgrade head
```

## 贡献

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 根据需要添加测试
5. 提交拉取请求

## 文档

- **[认领系统完整指南](./docs/features/claim/CLAIM_SYSTEM_COMPLETE.md)** - 认领系统的完整实现报告
- **[用户资料功能](./docs/features/user-profile/USER_PROFILE_COMPLETE.md)** - 用户资料和评价显示功能
- **[测试清单](./docs/testing/TEST_SCRIPTS_GUIDE.md)** - 全面的测试指南
- **[开发总结](./docs/TECHNICAL_SUMMARY.md)** - 开发完成总结

## 当前状态

### 已完成功能 (≈ 90%)
- ✅ 用户认证和授权
- ✅ 用户资料管理
- ✅ 帖子和评论的论坛系统
- ✅ 通知系统
- ✅ 物品分类
- ✅ 图片上传（单张和多张）
- ✅ 高级搜索和筛选
- ✅ 智能匹配算法
- ✅ **认领系统** (新增)
- ✅ **评价系统** (新增)
- ✅ **信用评分系统** (新增)
- ✅ **用户资料页面** (新增) ✨

### 可选增强功能
- ⚠️ 管理员仪表板
- ✅ 实时消息 (WebSocket)
- ✅ 邮件通知
- ⚠️ 数据分析和报告

## 许可证

本项目采用 MIT 许可证。