# 6–13 期原稿图像 source 锚点审查

Task ID：`XYY-20260908-05`。本文件记录本轮对第 6–13 期原 PDF 的有界只读审查，供后续实现阶段选择真实图/表 source 锚点；不代表 6–13 期 HTML 功能已验收。

## 坐标与证据约定

- 坐标是原 PDF 页面坐标，单位为 pt，格式为 `x0,y0,x1,y1`，原点在左上角。
- 6–9、11–13 期为横版页面，页面约 `1207.56 × 824.88 pt`；`side=left/right` 是对应的分栏渲染侧，但 bbox 仍是整页坐标（右侧 x 通常大于 603.78）。
- 第 10 期为 A4 竖版，页面 `594.96 × 841.92 pt`，`side=full`。
- `layout` 是本轮实际查看的原稿布局 PNG；`crop` 是从对应原 PDF bbox 渲染的本轮证据。没有重新 OCR，也未把整页或固定 bbox 当作图片。

## 推荐 source 区域

| 期数 | physicalPage | side | bbox（PDF pt） | 实际可辨识内容 | 本轮证据 |
|---|---:|---|---|---|---|
| 06 | 4 | left | `220,255,550,385` | 纺织服装行业数据图表 Fig1–2：国内 328 棉指价格、CotlookA 价格指数趋势。 | [layout](../output/whitepapers-ocr-layout/issue-06/page-004-left.png) · [crop](../output/whitepapers-archive-figures-audit/issue-06-p04-fig1-2-v2.png) |
| 06 | 4 | left | `220,385,550,520` | Fig3–4：粘胶短纤、涤纶长丝价格趋势，图线和标题均在裁剪内。 | [layout](../output/whitepapers-ocr-layout/issue-06/page-004-left.png) · [crop](../output/whitepapers-archive-figures-audit/issue-06-p04-fig3-4-v2.png) |
| 06 | 4 | left | `220,520,550,640` | Fig5–6：棕榈油、LDPE 价格趋势；下边界收至 y=640，避开下一排 Fig7–8 的标题/曲线残片。 | [layout](../output/whitepapers-ocr-layout/issue-06/page-004-left.png) · [crop](../output/whitepapers-archive-figures-audit/issue-06-p04-fig5-6-y640.png) |
| 07 | 3 | right | `720,190,1140,385` | 纺织制造车间纺纱/锭子设备的横向实拍图，主体完整，非装饰插画。 | [layout](../output/whitepapers-ocr-layout/issue-07/page-003-right.png) · [crop](../output/whitepapers-archive-figures-audit/issue-07-p03-right-warehouse-spindle.png) |
| 07 | 4 | left | `60,145,550,470` | A 股纺织服装相关指数及盈利预测折线图组，含图例、坐标轴和图题，可辨识为数据图表而非整页。 | [layout](../output/whitepapers-ocr-layout/issue-07/page-004-left.png) · [crop](../output/whitepapers-archive-figures-audit/issue-07-p04-left-market-trend-charts.png) |
| 08 | 3 | right | `760,185,1185,545` | 羽绒服产品实拍/展示图：三件绿色羽绒外套，圆形构图内主体完整。 | [layout](../output/whitepapers-ocr-layout/issue-08/page-003-right.png) · [crop](../output/whitepapers-archive-figures-audit/issue-08-p03-right-down-jacket-product-photo.png) |
| 08 | 5 | right | `660,75,1198,495` | “最美时尚之夜”现场合影及奖项实拍，包含舞台、多人和奖杯；红色背景为活动现场而非单纯装饰。 | [layout](../output/whitepapers-ocr-layout/issue-08/page-005-right.png) · [crop](../output/whitepapers-archive-figures-audit/issue-08-p05-right-fashion-event-award-photo.png) |
| 09 | 3 | right | `660,180,1195,500` | HLA 服装门店/展厅实拍，门头、橱窗和店内陈列完整。 | [layout](../output/whitepapers-ocr-layout/issue-09/page-003-right.png) · [crop](../output/whitepapers-archive-figures-audit/issue-09-p03-right-warehouse-storefront-photo.png) |
| 09 | 4 | left | `60,245,550,635` | 服饰行业市场/指数折线图组，含多条数据线、图例和坐标；裁剪范围局部且不是整页。 | [layout](../output/whitepapers-ocr-layout/issue-09/page-004-left.png) · [crop](../output/whitepapers-archive-figures-audit/issue-09-p04-left-fashion-market-chart-group.png) |
| 10 | 6 | full | `140,125,300,220` | 上半部印刷页 14–15 电商文章：云仓货架/周转箱的云形框实拍图。 | [layout](../output/whitepapers-ocr-layout/issue-10/page-006.png) · [crop](../output/whitepapers-archive-figures-audit/issue-10-p06-top-left-ecommerce-warehouse.png) |
| 10 | 6 | full | `130,520,255,590` | 下半部印刷页 16–17 跨境文章：仓库建筑外景实拍，明确属于下方跨境文章。 | [layout](../output/whitepapers-ocr-layout/issue-10/page-006.png) · [crop](../output/whitepapers-archive-figures-audit/issue-10-p06-bottom-left-crossborder-exterior.png) |
| 10 | 6 | full | `380,410,500,470` | 下半部印刷页 16–17 跨境文章：仓内货架/打包作业区实拍，区别于上方电商文章。 | [layout](../output/whitepapers-ocr-layout/issue-10/page-006.png) · [crop](../output/whitepapers-archive-figures-audit/issue-10-p06-bottom-right-crossborder-warehouse.png) |
| 11 | 8 | left | `235,375,535,600` | 仓内质检/分拣流水线实拍，多名工作人员与服装、标签、货架可见。 | [layout](../output/whitepapers-ocr-layout/issue-11/page-008-left.png) · [crop](../output/whitepapers-archive-figures-audit/issue-11-p08-left-quality-inspection-warehouse-photo.png) |
| 11 | 9 | left | `55,260,550,665` | 2024 年团队活动/年会照片拼图，含户外座谈合影及多张现场人物照片；范围非整页。 | [layout](../output/whitepapers-ocr-layout/issue-11/page-009-left.png) · [crop](../output/whitepapers-archive-figures-audit/issue-11-p09-left-annual-meeting-photo-collage.png) |
| 12 | 4 | right | `600,35,1207,320` | COSCO 集装箱船及港口吊机实拍，主体横向完整，关联跨境物流主题。 | [layout](../output/whitepapers-ocr-layout/issue-12/page-004-right.png) · [crop](../output/whitepapers-archive-figures-audit/issue-12-p04-right-container-ship-photo.png) |
| 12 | 6 | right | `600,5,1207,325` | 纺织车间/服装生产线实拍，服装和纱线设备清晰可见。 | [layout](../output/whitepapers-ocr-layout/issue-12/page-006-right.png) · [crop](../output/whitepapers-archive-figures-audit/issue-12-p06-right-textile-factory-photo.png) |
| 13 | 3 | right | `700,175,1170,485` | HLA 门店正面及店内陈列实拍，门头和中央人物海报清楚。 | [layout](../output/whitepapers-ocr-layout/issue-13/page-003-right.png) · [crop](../output/whitepapers-archive-figures-audit/issue-13-p03-right-HLA-storefront-photo.png) |
| 13 | 4 | left | `55,75,305,525` | 48 家公司营收/增幅/净利/增幅对照表，表头、序号和多行数据均在 bbox 内。 | [layout](../output/whitepapers-ocr-layout/issue-13/page-004-left.png) · [crop](../output/whitepapers-archive-figures-audit/issue-13-p04-left-company-market-table.png) |

## 验证范围与限制

本轮实际查看第 6、7、8、9、10、11、12、13 期各 2–3 个局部区域，共 18 个推荐；未覆盖第 1–5 期。重点覆盖第 6 期第 4 物理页纺织数据图表，以及第 10 期第 6 物理页上下两篇不同文章。PDF 页面尺寸和 bbox 越界检查记录在 [bbox-validation.txt](../output/whitepapers-archive-figures-audit/bbox-validation.txt)。

这些是 source 锚点建议，不是实现后的图片 HTTP、alt、版式或全文内容验收；裁剪中若需去除原稿文字/装饰，应由实现阶段在不改变事实的前提下再做最小裁边复核。原 PDF 未修改，未执行 OCR、build、PM2、CMS、数据库或外部写入。
