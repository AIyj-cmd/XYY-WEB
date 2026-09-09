# 白皮书 OCR 备料（XYY-20260908-05）

此目录只保存可提交的 OCR 处理说明与后续人工整理目录；原始 OCR 缓存写到 Git 忽略的 `output/whitepapers-ocr/`。

- 范围：仅《森林期刊》1–13 期的本机 OCR 证据，不能作为网页内容或替代原 PDF。
- 前提：6–9、11–13 每页没有原生文字层；1–5、10 的原生文字仅为打印页眉、URL、页码，正文在图像中。
- 横向期刊必须先分为左、右页半幅再 OCR，不能对整跨页混排识别。
- 每个缓存区域保留 PDF SHA-256、物理页、侧别、原生文字层分类、PNG、Tesseract TSV、词/行坐标及置信度。低于 50 置信度的词只记录位置和样例，不能据此补写正文。
- 该判断只适用于 `catalog.issues-1-13.json` 中已审查的源 SHA-256。脚本发现同一期 PDF 的 SHA-256 变化时会停止 OCR 并标记 `source-hash-changed`；必须先重新审查正文文字层，不能仅因期号与字符数沿用“页眉/URL/页码”结论。
- 执行示例：`/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python scripts/whitepapers/ocr_sources.py --issues 1,2 --workers 4`。

## XYY-20260908-05 处理记录

- 已以 200 dpi、`chi_sim+eng`、PSM 11、4 个并发任务完成 1–13 共 281 个物理页/半页 OCR 区域。每期 `manifest.json`、每个区域的 PNG、TSV 和 `.lines.json` 都在 `output/whitepapers-ocr/`；第 1–2 期已先行交给 Sol 检查。
- 已以相同源 SHA-256、200 dpi 和 4 个并发任务完成 PSM 3 布局缓存的 281 个同范围区域，位于独立忽略目录 `output/whitepapers-ocr-layout/`；PSM 11 原始稀疏文本证据和单页 PSM 3 对照都未覆盖。PSM 3 作为栏/段结构候选，不作为免审正文。
- `catalog.issues-1-13.json` 保存 1–13 的刊名和自然描述建议、封面/目录主题锚点、PDF SHA-256 与 physicalPage/side 定位。它不是正文、网页数据或逐字校对结果。
- 已独立对第 6 期 physical page 3 right 运行 PSM 3，输出在 `output/whitepapers-ocr-layout-compare/`，未覆盖 PSM 11 缓存。PSM 3 识别 688 个词、9 个低置信词；PSM 11 为 670 个词、12 个低置信词。PSM 3 将左栏正文聚为 block 14–16，右栏聚为 block 19，较适合该双栏正文的“左栏后右栏”人工整理。

## 第 6–13 期离线转换入口

- `../convert_archives.py` 只拥有第 6–13 期；默认 `--issues all` 即为这八期，拒绝写入 1–5。它读取已存在的 PSM 3 缓存并核对 source SHA-256，不执行 OCR。
- 章节起点来自经原图复核的目录/印刷页映射，不能由“每 12 个 OCR block”之类的计数规则推断。`archive_layout.region_blocks()` 保留 Tesseract 的 block/paragraph 身份与原顺序，禁止将全局 y/x 排序当作双栏阅读顺序。
- 执行：`/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python scripts/whitepapers/convert_archives.py --issues all`；静态校验：`/tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python -m unittest tests/whitepapers/archive_conversion_test.py`。
- Tesseract TSV 并不是会把识别文字按 CSV 双引号转义的 CSV。解析器使用 `QUOTE_NONE` 保持每一个物理 TSV 行独立；已用未闭合 ASCII 双引号文字复现默认 `DictReader` 吞并下一行、并确认该配置保留两词两行。
- 上述两份全量缓存均已只从已有 TSV 机械重建 `words`/`lines` JSON（`--reparse-cache`）；该操作未渲染或 OCR，也未改 PNG、TSV 或源 PDF。
- 对照结论不改变全本基线：`lines` 按坐标 y/x 便于视觉定位，不能作为多栏阅读顺序。`words` 保留 Tesseract TSV 的原始出现顺序（数组 index 即 `originalOrder`），并保留 `block`、`paragraph`、`line`、`word`；每条 `lines.wordIndexes` 可回取这些原始词记录。需要章节整理时，应取 PSM 3 的 `words`/TSV，先按左/右 column region 和原始 block/paragraph/line 再由人工回看 PDF；图表、照片文字、名单和低置信词继续以局部图或待核查项处理。

后续转换必须等第 14 期通用阅读模板通过独立验收后，由 Sol 另行派发。
