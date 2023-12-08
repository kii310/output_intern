# Dependency Injection

## 概要
Dependency Injection(依存性注入)というのは、例えば、コントローラとサービス、サービスとリポジトリ間の依存関係を解消するものである。 <br>
コントローラはコードの内部でサービスを使用しているため、コントローラはサービスに依存している。 <br>
以下に`BOOTH`でのサンプルコードを示す。 (`BOOTH`は`shop`のようなもの)
```typescript
// boothsController.ts
const boothsController = async (prisma: PrismaClient): Promise<Booth[]> => {
  const booths: Booth[] = await boothsService(prisma); // ここで依存が発生している
  return booths;
};
```

## 解決
依存を解消するために、依存の対象であるサービスを引数として外部から受け取るようにする。 <br>
依存が発生していることの問題は、関数として副作用が発生しやすく、テストが困難。 <br>
目標は、副作用の発生しない純粋関数 <br>
依存を外部から受け取っていることから、依存性注入（DI）となる。 <br>
```typescript
// boothsController.ts
const boothsController = async (boothsService: BoothsService, prisma: PrismaClient): Promise<Booth[]> => {
  const booths: Booth[] = await boothsService(prisma); // これは依存していない
  return booths;
};
```
<br>
次に、サービスと今までの引数(`prisma`)を同時に受け取るのは分かりにくくなる。そのため、カリー化と部分適用で関数によるクラスの再現をする。 <br>

```typescript
// boothsController.ts
const boothsController = (boothsService: BoothsService): (prisma: PrismaClient) => Promise<Booth[]> => {
// コンストラクタのようなもの
  return async (prisma: PrismaClient): Promise<Booth[]> => {
    const booths: Booth[] = await boothsService(prisma);
    return booths;
  };
};

const boothsControllerInstance = boothsController(boothsService);
```
`boothsController`は、クラスの役割を果たしている、そのため、インターフェイスや抽象クラスと同じである。 <br>
つまり、ここのコードで行なっていることは、クラス（具象クラス）とインスタンスの生成を分離している。 <br>
また、`boothsController`はファクトリパターンと見ることができる。 <br>

次に、実際に合わせてより細かく実装していく。 <br>
```typescript
// boothsController.ts
type BoothsController = {
  index: Index,
  show: Show,
};

type Index = (booths: BoothsService) => (prisma: PrismaClient) => Promise<Booth[]>;
type Show = (booths: BoothsService) => (prisma: PrismaClient) => Promise<Booth | null>;

const index: Index = (boothsService: BoothsService): (prisma: PrismaClient) => Promise<Booth[]> => {
  return async (prisma: PrismaClient): Promise<Booth[]> => {
    const booths: Booth[] = await boothsService.index(prisma);
    return booths;
  };
};

const show: Show = (boothsService: BoothsService): (prisma: PrismaClient) => Promise<Booth | null> => {
  return async (prisma: PrismaClient): Promise<Booth | null> => {
    const booth: Booth | null = await boothsService.show(prisma);
    return booth;
  };
};

export const boothsController: BoothsController = {
  index: index,
  show: show,
};
```

このコードは、インスタンスを生成していない具象クラスだけのコードになっている。 <br>
ここで他の層（サービスやリポジトリ）との連携を考えると、エクスポートするのはインスタンスの方が使いやすいと考えられる。 <br>
以下がインスタンスを返すコードになっている。 <br>
```typescript
// boothsController.ts
type BoothsController = {
  indexInstance: IndexInstance,
  showInstance: ShowInstance,
};

type Index = (booths: BoothsService) => IndexInstance;
type Show = (booths: BoothsService) => ShowInstance;

type IndexInstance = (prisma: PrismaClient) => Promise<Booth[]>;
type ShowInstance = (prisma: PrismaClient) => Promise<Booth | null>;

const index: Index = (boothsService: BoothsService): IndexInstance => {
  return async (prisma: PrismaClient): Promise<Booth[]> => {
    const booths: Booth[] = await boothsService.index(prisma);
    return booths;
  };
};

const indexInstance: IndexInstance = index(boothsService);

const show: Show = (boothsService: BoothsService): ShowInstance => {
  return async (prisma: PrismaClient): Promise<Booth | null> => {
    const booth: Booth | null = await boothsService.show(prisma);
    return booth;
  };
};

const showInstance: ShowInstance = show(boothsService);

export const boothsController: BoothsController = {
  indexInstance: indexInstance,
  showInstance: showInstance,
};
```

`index`と`indexInstance`だと名前が分かりにくいので、次のように変更する。
- `index` => `indexIF` (IFはインターフェイスのことで、一般的にこう使われる)
- `indexInstance` => `index`

以下が修正したコードになる。 <br>
```typescript
// boothsController.ts
type BoothsController = {
  index: Index,
  show: Show,
};

type IndexIF = (booths: BoothsService) => Index;
type ShowIF = (booths: BoothsService) => Show;

type Index = (prisma: PrismaClient) => Promise<Booth[]>;
type Show = (prisma: PrismaClient) => Promise<Booth | null>;

const indexIF: IndexIF = (boothsService: BoothsService): Index => {
  return async (prisma: PrismaClient): Promise<Booth[]> => {
    const booths: Booth[] = await boothsService.index(prisma);
    return booths;
  };
};

const index: Index = indexIF(boothsService);

const showIF: ShowIF = (boothsService: BoothsService): Show => {
  return async (prisma: PrismaClient): Promise<Booth | null> => {
    const booth: Booth | null = await boothsService.show(prisma);
    return booth;
  };
};

const show: Show = showIF(boothsService);

export const boothsController: BoothsController = {
  index: index,
  show: show,
};
```

余分に型を宣言している部分があるので整理する。 <br>
完成したコードが以下のもの。 <br>
```typescript
// boothsController.ts
import { prisma, PrismaClient } from '~/src/libs/prisma';
import { boothsService, BoothsService } from '~/src/services/booths';
import type { Booth } from '~/src/types/booths';

type BoothsController = {
  index: Index,
  show: Show,
};

type IndexIF = (booths: BoothsService) => Index;
type Index = (prisma: PrismaClient) => Promise<Booth[]>;

const indexIF: IndexIF = (boothsService) => {
  return async (prisma) => {
    const booths: Booth[] = await boothsService.index(prisma);
    return booths;
  };
};


type ShowIF = (booths: BoothsService) => Show;
type Show = (prisma: PrismaClient) => Promise<Booth | null>;

const showIF: ShowIF = (boothsService) => {
  return async (prisma) => {
    const booth: Booth | null = await boothsService.show(prisma);
    return booth;
  };
};

export const boothsController: BoothsController = {
  index: indexIF(boothsService),
  show: showIF(boothsService),
};
```
