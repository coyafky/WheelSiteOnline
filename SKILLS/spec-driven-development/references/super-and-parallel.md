# S.U.P.E.R 与并行协议

## S.U.P.E.R

Single Purpose、Unidirectional Flow、Ports over Implementation、Environment-Agnostic、Replaceable Parts。Phase 3 形成约束，Review SPD 逐项复核。

## 并行

最多 4 条泳道；每条泳道有独立验收、明确 owner、依赖和不相交文件集。共享入口、类型契约、锁文件、同一配置或同一数据库迁移不能同时修改。发现文件集相交时停止并重新分解，不靠事后合并冲突维持并行。
