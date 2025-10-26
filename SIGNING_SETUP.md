# Android 签名配置说明

## 概述

本项目支持两种签名模式：
- **测试签名**：当没有配置正式签名环境变量时，使用默认的 debug.keystore
- **正式签名**：当配置了正式签名环境变量时，使用正式 keystore 文件

## GitHub Actions 配置

### 1. 设置环境变量

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下环境变量：

- `ANDROID_KEYSTORE_BASE64`: 将 keystore 文件转换为 base64 字符串
  ```bash
  # 在本地生成 base64
  base64 -i your-release-key.keystore
  ```

- `ANDROID_KEYSTORE_PASSWORD`: keystore 密码
- `ANDROID_KEY_ALIAS`: key 别名
- `ANDROID_KEY_PASSWORD`: key 密码

### 2. 生成 keystore 文件（如果没有）

```bash
keytool -genkey -v -keystore your-release-key.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 3. 工作流逻辑

- 当设置了 `ANDROID_KEYSTORE_BASE64` 环境变量时：
  - 构建 release 版本的 APK
  - 使用正式 keystore 文件签名
  
- 当未设置 `ANDROID_KEYSTORE_BASE64` 环境变量时：
  - 构建 debug 版本的 APK
  - 使用默认的 debug.keystore 签名

## 本地开发

对于本地开发，默认使用 debug.keystore。如果需要使用正式签名，可以：

1. 在项目根目录创建 `.env` 文件
2. 添加相应的环境变量：

```
ANDROID_KEYSTORE_FILE=release.keystore
ANDROID_KEYSTORE_PASSWORD=your_password
ANDROID_KEY_ALIAS=your_alias
ANDROID_KEY_PASSWORD=your_password
```

3. 将 keystore 文件放在 `android/app/` 目录下

## 注意事项

- 请妥善保管 keystore 文件和密码，不要提交到版本控制
- 在 GitHub Actions 中使用 Secrets 存储敏感信息
- 每次构建都会检查环境变量，优先使用正式签名