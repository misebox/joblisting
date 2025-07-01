// Test cases for JobListingParser

export const testCases = [
  {
    name: 'Standard job listing with all fields',
    input: `案件1：Webアプリケーション開発
会社：株式会社テスト
商流：直請け
単価：80万円
期間：6ヶ月
場所：東京都港区
精算：150-180時間
面談：1回
時間：9:00-18:00
備考：リモート勤務可

＜概要＞
ECサイトのバックエンド開発を行います。
新規機能の実装とシステム改修が主な業務です。

＜必須スキル＞
・Java 3年以上
・Spring Boot 1年以上
・MySQL経験

＜尚可スキル＞
・AWS経験
・Docker経験

＜開発環境＞
・Java 11
・Spring Boot 2.6
・MySQL 8.0
・AWS`,
    expected: {
      title: 'Webアプリケーション開発',
      company: '株式会社テスト',
      distribution: '直請け',
      price: '80万円',
      period: '6ヶ月',
      location: '東京都港区',
      billing: '150-180時間',
      interview: '1回',
      time: '9:00-18:00',
      notes: 'リモート勤務可'
    }
  },
  {
    name: 'Job listing with ＜環境＞ instead of ＜開発環境＞',
    input: `案件2：React開発
会社：Tech Company
単価：75万円

＜概要＞
フロントエンド開発

＜環境＞
・React 18
・TypeScript 4.5`,
    expected: {
      title: 'React開発',
      company: 'Tech Company',
      price: '75万円'
    }
  },
  {
    name: 'Job listing with full-width numbers',
    input: `案件１０：フルスタック開発
会社：フルワイド株式会社
単価：９０万円

＜概要＞
フルスタック開発案件`,
    expected: {
      title: 'フルスタック開発',
      company: 'フルワイド株式会社',
      price: '９０万円'
    }
  },
  {
    name: 'Job listing with minimal fields',
    input: `案件99：シンプル案件

＜概要＞
最小限の案件情報`,
    expected: {
      title: 'シンプル案件'
    }
  },
  {
    name: 'Job listing with special characters in multiline fields',
    input: `案件5：特殊文字テスト

＜概要＞
特殊な文字を含む案件：
・【重要】セキュリティ対応
・＜注意＞パフォーマンス要件

＜必須スキル＞
・Java（Spring Boot）
・AWS（EC2/RDS）`,
    expected: {
      title: '特殊文字テスト'
    }
  },
  {
    name: 'Job listing with mixed brackets and nested content',
    input: `案件6：複雑な構造

＜概要＞
複雑な構造のテスト案件
【フェーズ1】要件定義
＜フェーズ2＞設計・開発
（フェーズ3）テスト

＜必須スキル＞
・Java 3年以上（Spring Boot必須）
・SQL（MySQL or PostgreSQL）
・【重要】チームワーク

＜尚可スキル＞
・AWS経験（EC2, RDS等）
・Docker/Kubernetes`,
    expected: {
      title: '複雑な構造'
    }
  }
];

export const errorTestCases = [
  {
    name: 'Missing title',
    input: `会社：株式会社テスト
単価：80万円

＜概要＞
タイトルのない案件`,
    expectedError: 'MissingTitleError'
  },
  {
    name: 'Block with content but no title pattern',
    input: `会社：株式会社テスト
単価：80万円
期間：6ヶ月

＜概要＞
タイトルパターンが間違っている案件`,
    expectedError: 'MissingTitleError'
  },
  {
    name: 'Malformed title',
    input: `案件：タイトルなし番号
会社：テスト会社`,
    expectedError: 'MissingTitleError'
  }
];

export const multiBlockTestCase = {
  name: 'Multiple job listings',
  input: `案件1：第一案件
会社：会社A
単価：70万円

＜概要＞
第一の案件です

**************************************

案件2：第二案件
会社：会社B
単価：80万円

＜概要＞
第二の案件です

**************************************

案件3：第三案件
会社：会社C`,
  expectedCount: 3
};