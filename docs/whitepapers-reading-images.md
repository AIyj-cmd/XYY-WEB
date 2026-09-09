# 白皮书阅读图派生资源

`src/data/whitepaper-figure-assets.json` 是阅读页可选用的资源清单。它的键是既有正文图的 `src`；每项只提供替代资源路径、实际像素尺寸、独立展示宽度和资源分类，不含正文或新的业务数据。

`scripts/whitepapers/enhance_reading_images.py` 只处理其内置的显式清单。脚本先核验相应期号 JSON 内的 PDF SHA-256 与本地原 PDF，再按该 figure 已记录的页码和同一局部区域导出资源。它不会修改原 PDF、正文 JSON 或第一代图片。

可缩放的图解和表格以 288dpi 重新栅格化，使用无损 WebP；桌面展示宽度另行限制在 768px 或原有窄图的合理宽度。第 14 期三张出口图在原稿中是低分辨率嵌入 JPEG，阅读资源保留其原始像素而不插值，因此标为 `source-limited`。

当前共 31 项：第 14 期 27 张可缩放图、第 12 期 1 张质检表，以及第 14 期 3 张原生低清图表。文件总计 5,180,342 字节，最大单图 445,520 字节。第 7 期招聘海报等原本低清的图片未加入增强清单，仍使用原图并避免放大；高清导出不能恢复原稿缺失的细节。

本地重建与校验：

需要 Python 3.11 或更新版本、Poppler 的 `pdfinfo` / `pdftoppm` / `pdfimages`，以及 ImageMagick 的 `identify` / `convert`。正常访问和网站构建不执行此脚本。

```bash
python3 scripts/whitepapers/enhance_reading_images.py
python3 scripts/whitepapers/enhance_reading_images.py --check
python3 tests/whitepapers/reading_images_test.py
```

脚本的中间渲染使用隔离临时目录，退出时自动清理；人工对照证据保存在被忽略的 `output/pdf/whitepaper05-reading-images/` 或本轮 `output/playwright/` 证据目录，不会成为公开资源。
