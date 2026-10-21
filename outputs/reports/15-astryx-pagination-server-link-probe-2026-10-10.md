# Astryx Pagination 服务端链接适配探针

## 问题

当前轮毂目录分页使用普通 `<a href>`，筛选、排序、工艺边界和页码全部编码在 URL 中，
因此复制、刷新、无 JavaScript 访问和搜索引擎跟随都成立。需要确认 Astryx `Pagination`
能否在不改变这条契约的前提下接入。

## 探针方法

固定 Astryx `@astryxdesign/core@0.6.7`，以 `page=2`、`totalPages=5`、`onChange` 渲染
官方 `Pagination`，检查服务端静态标记：

- 是否生成 `aria-current="page"`；
- 是否生成可访问的上一页、下一页和页码控件；
- 控件是否是普通链接，能否携带现有目录 URL；
- 是否必须依赖客户端 `onChange`。

自动探针见 `tests/astryx-pagination-probe.test.mts`。

## 结果

Astryx 组件确实生成了正确的分页 landmark、当前页语义和可访问名称，但输出的是 `<button>`，
没有生成 `<a>`。官方 Props 也把 `onChange` 标为必填；因此它当前不能直接替换轮毂目录的
服务端分页。

## 决定

本切片不迁移 `WheelCataloguePagination`。继续使用现有普通链接实现，直到满足以下条件之一：

1. Astryx 提供明确的服务端链接渲染 API；或
2. 本项目新增一个经过评审的链接适配层，并证明不破坏筛选 URL、无 JS、SEO 和子目录工艺锁定。

不为了组件覆盖率把目录分页改成客户端状态。

## 下一步

继续评估 `Field`/`CheckboxInput` 是否可以只作为筛选控件外壳使用；筛选状态仍由 GET URL 和
服务端查询负责。该结论不阻塞当前网站发布。
