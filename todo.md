# TODO

## コンポーネントのリファクタリング

### バグ
- [ ] スターによるソートがうまく機能しない
### 重複コードの共通化
- [x] `formatDate()`関数を`/app/utils/formatting.ts`に移動
  - EntryList.tsxとEntryDetail.tsxで重複
- [x] ステータスラベル取得ロジックを`/app/utils/status.ts`に移動
  - EntryList.tsxの`getStatusLabel()`とEntryActions.tsxで重複

### 新規コンポーネントの作成
- [x] `StatusBadge`コンポーネントを作成
  - ステータス表示の共通化
- [x] `TagList`コンポーネントを作成
  - EntryList.tsxのタグ表示ロジックを抽出
- [ ] `FormField`コンポーネントを作成
  - `.filter-group`パターンの共通化

### その他の改善
- [ ] エラーハンドリングの改善
- [ ] TypeScriptの型定義を厳密化
- [ ] DB接続が増え続ける問題を解消

