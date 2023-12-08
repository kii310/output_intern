<img width="531" alt="スクリーンショット 2023-12-08 15 28 44" src="https://github.com/kii310/output_intern/assets/101162914/1a1f5fab-e8f0-47cd-8b1a-a257f240b4b2"># インターンでの成果
## 初めに
現在私はインターン先で1年半以上サーバサイドを経験しています。そこで溜まった知見をアウトプットとしてここにまとめたいと思います。また、携わったプロジェクトの関係上ソースコードを載せることができないため、ブログのような形で説明します。 <br>
クリーンアーキテクチャや自分の作った関数についてまとめていきます。

## クリーンアーキテクチャ
基本的にクリーンアーキテクチャを採用しており、以下の図のような構成になっております。
![directory.png](img/directory.png) <br>
コードの流れは、 <br>
`router → controller → service (dto) → redis → repository`となっています。

### ディレクトリ構成
各層の説明
- router <br>
  APIのパスを表している。ディレクトリ構成をパスと同じにすることで分かりやすくしている。 <br>
- controller <br>
  APIのリクエストを受け取り、レスポンスを返している。リクエストボディのバリデーションなども行なっている。 <br>
- service <br>
  ビジネスロジックを行なっている。また、DTOも行なっていて別にDTOを行う関数を分けている。 <br>
- repository <br>
  DBからエンティティの取得を行なっている。 <br>
- dto <br>
  service層で呼ばれる。repository層から取得してきたエンティティの整形のみをしている。バリデーションはここでは行わない。 <br>
- redis <br>
  キャッシュにRedisを利用していて、service層とrepository層の中継的な役割を担っている。キャッシュがあればrepositoryを呼ばずにそのままserviceに返している。 <br>

`controller`と`service`などでディレクトリ、ファイルを細かく分けてあるが、これはAPIごとにファイルを分けていて、ディレクトリを辿れば何のAPIか分かるようにしている。また、一つのファイルの大きさが小さくなるので、可読性や保守性が上がります。

### DI
各層では、依存性を作らないためにDIを行なっています。以下はcontroller層とservice層のコードで、最初にservice、redisを受け取ることでDIを行なっています。
