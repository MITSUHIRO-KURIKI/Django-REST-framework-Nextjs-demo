'use client';

// 使用していない動的クラスが生成されないため直書き

import React from 'react';

// Shadcn UIコンポーネント（パスはプロジェクトに合わせてください）
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/app/components/ui/shadcn/card';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/app/components/ui/shadcn/popover';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/app/components/ui/shadcn/alert';

// アイコン（lucide-react）
import {
  AlertOctagon,
  CheckCircle2,
  Info,
  AlertTriangle,
} from 'lucide-react';

export default function ColorDemoPage() {
  return (
    <div className="space-y-8 p-4">
      {/* ---- Sidebar サンプル ---- */}
      <div className="flex gap-4">
        {/* sidebar 風に見せるための div */}
        <div className="flex min-w-[200px] flex-col gap-2 rounded-lg bg-sidebar p-4 text-sidebar-foreground">
          <h2 className="font-bold">Sidebar</h2>
          <button className="rounded bg-sidebar-primary px-3 py-2 text-sidebar-primary-foreground">
            Primary Button
          </button>
          <button className="rounded bg-sidebar-accent px-3 py-2 text-sidebar-accent-foreground">
            Accent Button
          </button>
          <div className="my-2 border-t border-sidebar-border" />
          <p className="text-sm">
            Sidebar の
            <code className="rounded bg-sidebar-accent px-1 text-sidebar-accent-foreground">
              background
            </code>
            や
            <code className="rounded bg-sidebar-accent px-1 text-sidebar-accent-foreground">
              foreground
            </code>
            などが反映されています。
          </p>
        </div>

        {/* メインコンテンツに Card & Popover のサンプル */}
        <div className="flex-1 space-y-4">
          {/* ---- Card サンプル ---- */}
          <Card>
            <CardHeader>
              <CardTitle>Shadcn Card Sample</CardTitle>
              <CardDescription>
                This is a simple card description.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content goes here...</p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Footer area</p>
            </CardFooter>
          </Card>

          {/* ---- Popover サンプル ---- */}
          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-primary px-4 py-2 text-primary-foreground">
              Open Popover
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <p className="text-sm">Popover Content</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ---- すべてのカラーをまとめて表示 ---- */}
      <div className="space-y-8">
        {/* ----------- primary ----------- */}
        <div className="mb-8 space-y-4 rounded-md border border-border p-4">
          <h2 className="text-xl font-bold capitalize">primary</h2>

          {/* テキスト */}
          <p className="text-primary">
            これは <code>text-primary</code> です
          </p>

          {/* ボックス (背景色 + 前景色) */}
          <div className="rounded bg-primary p-2 text-primary-foreground">
            これは <code>bg-primary text-primary-foreground</code> のボックスです
          </div>

          {/* ボタン */}
          <button className="rounded bg-primary px-3 py-2 text-primary-foreground">
            primary Button
          </button>

          {/* カード */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                primary Card
              </CardTitle>
              <CardDescription className="text-primary-foreground">
                テキストは <code>--primary-foreground</code> です
              </CardDescription>
            </CardHeader>
            <CardContent>カードコンテンツ</CardContent>
            <CardFooter>カードフッター</CardFooter>
          </Card>

          {/* アラート (foregroundなし) */}
          <Alert className="flex items-start gap-2 border-l-4 border-primary px-3 py-2 text-primary [&>svg]:text-primary">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                primary Alert (no foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--primary</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* アラート (foregroundあり) */}
          <Alert className="flex items-start gap-2 border-l-4 border-primary-foreground px-3 py-2 text-primary-foreground [&>svg]:text-primary-foreground">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                primary Alert (with foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--primary-foreground</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* ポップオーバー */}
          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-primary px-4 py-2 text-primary-foreground">
              Open primary Popover
            </PopoverTrigger>
            <PopoverContent className="w-48 rounded bg-primary p-2 text-primary-foreground">
              <p className="text-sm">
                primary Popover Content
              </p>
            </PopoverContent>
          </Popover>
        </div>

        {/* ----------- secondary ----------- */}
        <div className="mb-8 space-y-4 rounded-md border border-border p-4">
          <h2 className="text-xl font-bold capitalize">secondary</h2>

          <p className="text-secondary">
            これは <code>text-secondary</code> です
          </p>

          <div className="rounded bg-secondary p-2 text-secondary-foreground">
            これは <code>bg-secondary text-secondary-foreground</code> のボックスです
          </div>

          <button className="rounded bg-secondary px-3 py-2 text-secondary-foreground">
            secondary Button
          </button>

          <Card className="bg-secondary text-secondary-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                secondary Card
              </CardTitle>
              <CardDescription className="text-secondary-foreground">
                テキストは <code>--secondary-foreground</code> です
              </CardDescription>
            </CardHeader>
            <CardContent>カードコンテンツ</CardContent>
            <CardFooter>カードフッター</CardFooter>
          </Card>

          {/* アラート (foregroundなし) */}
          <Alert className="flex items-start gap-2 border-l-4 border-secondary px-3 py-2 text-secondary [&>svg]:text-secondary">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                secondary Alert (no foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--secondary</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* アラート (foregroundあり) */}
          <Alert className="flex items-start gap-2 border-l-4 border-secondary-foreground px-3 py-2 text-secondary-foreground [&>svg]:text-secondary-foreground">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                secondary Alert (with foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--secondary-foreground</code> です
              </AlertDescription>
            </div>
          </Alert>

          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-secondary px-4 py-2 text-secondary-foreground">
              Open secondary Popover
            </PopoverTrigger>
            <PopoverContent className="w-48 rounded bg-secondary p-2 text-secondary-foreground">
              <p className="text-sm">
                secondary Popover Content
              </p>
            </PopoverContent>
          </Popover>
        </div>

        {/* ----------- success ----------- */}
        <div className="mb-8 space-y-4 rounded-md border border-border p-4">
          <h2 className="text-xl font-bold capitalize">success</h2>

          <p className="text-success">
            これは <code>text-success</code> です
          </p>

          <div className="rounded bg-success p-2 text-success-foreground">
            これは <code>bg-success text-success-foreground</code> のボックスです
          </div>

          <button className="rounded bg-success px-3 py-2 text-success-foreground">
            success Button
          </button>

          <Card className="bg-success text-success-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                success Card
              </CardTitle>
              <CardDescription className="text-success-foreground">
                テキストは <code>--success-foreground</code> です
              </CardDescription>
            </CardHeader>
            <CardContent>カードコンテンツ</CardContent>
            <CardFooter>カードフッター</CardFooter>
          </Card>

          {/* アラート (foregroundなし) */}
          <Alert className="flex items-start gap-2 border-l-4 border-success px-3 py-2 text-success [&>svg]:text-success">
            <CheckCircle2 className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                success Alert (no foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--success</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* アラート (foregroundあり) */}
          <Alert className="flex items-start gap-2 border-l-4 border-success-foreground px-3 py-2 text-success-foreground [&>svg]:text-success-foreground">
            <CheckCircle2 className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                success Alert (with foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--success-foreground</code> です
              </AlertDescription>
            </div>
          </Alert>

          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-success px-4 py-2 text-success-foreground">
              Open success Popover
            </PopoverTrigger>
            <PopoverContent className="w-48 rounded bg-success p-2 text-success-foreground">
              <p className="text-sm">
                success Popover Content
              </p>
            </PopoverContent>
          </Popover>
        </div>

        {/* ----------- info ----------- */}
        <div className="mb-8 space-y-4 rounded-md border border-border p-4">
          <h2 className="text-xl font-bold capitalize">info</h2>

          <p className="text-info">
            これは <code>text-info</code> です
          </p>

          <div className="rounded bg-info p-2 text-info-foreground">
            これは <code>bg-info text-info-foreground</code> のボックスです
          </div>

          <button className="rounded bg-info px-3 py-2 text-info-foreground">
            info Button
          </button>

          <Card className="bg-info text-info-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                info Card
              </CardTitle>
              <CardDescription className="text-info-foreground">
                テキストは <code>--info-foreground</code> です
              </CardDescription>
            </CardHeader>
            <CardContent>カードコンテンツ</CardContent>
            <CardFooter>カードフッター</CardFooter>
          </Card>

          {/* アラート (foregroundなし) */}
          <Alert className="flex items-start gap-2 border-l-4 border-info px-3 py-2 text-info [&>svg]:text-info">
            <Info className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                info Alert (no foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--info</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* アラート (foregroundあり) */}
          <Alert className="flex items-start gap-2 border-l-4 border-info-foreground px-3 py-2 text-info-foreground [&>svg]:text-info-foreground">
            <Info className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                info Alert (with foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--info-foreground</code> です
              </AlertDescription>
            </div>
          </Alert>

          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-info px-4 py-2 text-info-foreground">
              Open info Popover
            </PopoverTrigger>
            <PopoverContent className="w-48 rounded bg-info p-2 text-info-foreground">
              <p className="text-sm">
                info Popover Content
              </p>
            </PopoverContent>
          </Popover>
        </div>

        {/* ----------- warning ----------- */}
        <div className="mb-8 space-y-4 rounded-md border border-border p-4">
          <h2 className="text-xl font-bold capitalize">warning</h2>

          <p className="text-warning">
            これは <code>text-warning</code> です
          </p>

          <div className="rounded bg-warning p-2 text-warning-foreground">
            これは <code>bg-warning text-warning-foreground</code> のボックスです
          </div>

          <button className="rounded bg-warning px-3 py-2 text-warning-foreground">
            warning Button
          </button>

          <Card className="bg-warning text-warning-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                warning Card
              </CardTitle>
              <CardDescription className="text-warning-foreground">
                テキストは <code>--warning-foreground</code> です
              </CardDescription>
            </CardHeader>
            <CardContent>カードコンテンツ</CardContent>
            <CardFooter>カードフッター</CardFooter>
          </Card>

          {/* アラート (foregroundなし) */}
          <Alert className="flex items-start gap-2 border-l-4 border-warning px-3 py-2 text-warning [&>svg]:text-warning">
            <AlertTriangle className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                warning Alert (no foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--warning</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* アラート (foregroundあり) */}
          <Alert className="flex items-start gap-2 border-l-4 border-warning-foreground px-3 py-2 text-warning-foreground [&>svg]:text-warning-foreground">
            <AlertTriangle className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                warning Alert (with foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--warning-foreground</code> です
              </AlertDescription>
            </div>
          </Alert>

          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-warning px-4 py-2 text-warning-foreground">
              Open warning Popover
            </PopoverTrigger>
            <PopoverContent className="w-48 rounded bg-warning p-2 text-warning-foreground">
              <p className="text-sm">
                warning Popover Content
              </p>
            </PopoverContent>
          </Popover>
        </div>

        {/* ----------- danger ----------- */}
        <div className="mb-8 space-y-4 rounded-md border border-border p-4">
          <h2 className="text-xl font-bold capitalize">danger</h2>

          <p className="text-danger">
            これは <code>text-danger</code> です
          </p>

          <div className="rounded bg-danger p-2 text-danger-foreground">
            これは <code>bg-danger text-danger-foreground</code> のボックスです
          </div>

          <button className="rounded bg-danger px-3 py-2 text-danger-foreground">
            danger Button
          </button>

          <Card className="bg-danger text-danger-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                danger Card
              </CardTitle>
              <CardDescription className="text-danger-foreground">
                テキストは <code>--danger-foreground</code> です
              </CardDescription>
            </CardHeader>
            <CardContent>カードコンテンツ</CardContent>
            <CardFooter>カードフッター</CardFooter>
          </Card>

          {/* アラート (foregroundなし) */}
          <Alert className="flex items-start gap-2 border-l-4 border-danger px-3 py-2 text-danger [&>svg]:text-danger">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                danger Alert (no foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--danger</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* アラート (foregroundあり) */}
          <Alert className="flex items-start gap-2 border-l-4 border-danger-foreground px-3 py-2 text-danger-foreground [&>svg]:text-danger-foreground">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                danger Alert (with foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--danger-foreground</code> です
              </AlertDescription>
            </div>
          </Alert>

          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-danger px-4 py-2 text-danger-foreground">
              Open danger Popover
            </PopoverTrigger>
            <PopoverContent className="w-48 rounded bg-danger p-2 text-danger-foreground">
              <p className="text-sm">
                danger Popover Content
              </p>
            </PopoverContent>
          </Popover>
        </div>

        {/* ----------- accent ----------- */}
        <div className="mb-8 space-y-4 rounded-md border border-border p-4">
          <h2 className="text-xl font-bold capitalize">accent</h2>

          <p className="text-accent">
            これは <code>text-accent</code> です
          </p>

          <div className="rounded bg-accent p-2 text-accent-foreground">
            これは <code>bg-accent text-accent-foreground</code> のボックスです
          </div>

          <button className="rounded bg-accent px-3 py-2 text-accent-foreground">
            accent Button
          </button>

          <Card className="bg-accent text-accent-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                accent Card
              </CardTitle>
              <CardDescription className="text-accent-foreground">
                テキストは <code>--accent-foreground</code> です
              </CardDescription>
            </CardHeader>
            <CardContent>カードコンテンツ</CardContent>
            <CardFooter>カードフッター</CardFooter>
          </Card>

          {/* アラート (foregroundなし) */}
          <Alert className="flex items-start gap-2 border-l-4 border-accent px-3 py-2 text-accent [&>svg]:text-accent">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                accent Alert (no foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--accent</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* アラート (foregroundあり) */}
          <Alert className="flex items-start gap-2 border-l-4 border-accent-foreground px-3 py-2 text-accent-foreground [&>svg]:text-accent-foreground">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                accent Alert (with foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--accent-foreground</code> です
              </AlertDescription>
            </div>
          </Alert>

          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-accent px-4 py-2 text-accent-foreground">
              Open accent Popover
            </PopoverTrigger>
            <PopoverContent className="w-48 rounded bg-accent p-2 text-accent-foreground">
              <p className="text-sm">
                accent Popover Content
              </p>
            </PopoverContent>
          </Popover>
        </div>

        {/* ----------- muted ----------- */}
        <div className="mb-8 space-y-4 rounded-md border border-border p-4">
          <h2 className="text-xl font-bold capitalize">muted</h2>

          <p className="text-muted">
            これは <code>text-muted</code> です
          </p>

          <div className="rounded bg-muted p-2 text-muted-foreground">
            これは <code>bg-muted text-muted-foreground</code> のボックスです
          </div>

          <button className="rounded bg-muted px-3 py-2 text-muted-foreground">
            muted Button
          </button>

          <Card className="bg-muted text-muted-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                muted Card
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                テキストは <code>--muted-foreground</code> です
              </CardDescription>
            </CardHeader>
            <CardContent>カードコンテンツ</CardContent>
            <CardFooter>カードフッター</CardFooter>
          </Card>

          {/* アラート (foregroundなし) */}
          <Alert className="flex items-start gap-2 border-l-4 border-muted px-3 py-2 text-muted [&>svg]:text-muted">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                muted Alert (no foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--muted</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* アラート (foregroundあり) */}
          <Alert className="flex items-start gap-2 border-l-4 border-muted-foreground px-3 py-2 text-muted-foreground [&>svg]:text-muted-foreground">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                muted Alert (with foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--muted-foreground</code> です
              </AlertDescription>
            </div>
          </Alert>

          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-muted px-4 py-2 text-muted-foreground">
              Open muted Popover
            </PopoverTrigger>
            <PopoverContent className="w-48 rounded bg-muted p-2 text-muted-foreground">
              <p className="text-sm">
                muted Popover Content
              </p>
            </PopoverContent>
          </Popover>
        </div>

        {/* ----------- destructive ----------- */}
        <div className="mb-8 space-y-4 rounded-md border border-border p-4">
          <h2 className="text-xl font-bold capitalize">destructive</h2>

          <p className="text-destructive">
            これは <code>text-destructive</code> です
          </p>

          <div className="rounded bg-destructive p-2 text-destructive-foreground">
            これは <code>bg-destructive text-destructive-foreground</code> のボックスです
          </div>

          <button className="rounded bg-destructive px-3 py-2 text-destructive-foreground">
            destructive Button
          </button>

          <Card className="bg-destructive text-destructive-foreground">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                destructive Card
              </CardTitle>
              <CardDescription className="text-destructive-foreground">
                テキストは <code>--destructive-foreground</code> です
              </CardDescription>
            </CardHeader>
            <CardContent>カードコンテンツ</CardContent>
            <CardFooter>カードフッター</CardFooter>
          </Card>

          {/* アラート (foregroundなし) */}
          <Alert className="flex items-start gap-2 border-l-4 border-destructive px-3 py-2 text-destructive [&>svg]:text-destructive">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                destructive Alert (no foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--destructive</code> です
              </AlertDescription>
            </div>
          </Alert>

          {/* アラート (foregroundあり) */}
          <Alert className="flex items-start gap-2 border-l-4 border-destructive-foreground px-3 py-2 text-destructive-foreground [&>svg]:text-destructive-foreground">
            <AlertOctagon className="mt-1 size-4" />
            <div>
              <AlertTitle className="font-semibold capitalize">
                destructive Alert (with foreground)
              </AlertTitle>
              <AlertDescription>
                テキストは <code>--destructive-foreground</code> です
              </AlertDescription>
            </div>
          </Alert>

          <Popover>
            <PopoverTrigger className="inline-flex items-center rounded bg-destructive px-4 py-2 text-destructive-foreground">
              Open destructive Popover
            </PopoverTrigger>
            <PopoverContent className="w-48 rounded bg-destructive p-2 text-destructive-foreground">
              <p className="text-sm">
                destructive Popover Content
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}