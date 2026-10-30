# cloud-log-to-mac

クラウドで動く Claude のセッションで、ターンが終わるたびにそのターンのやりとり（ユーザー発言・Claude の回答・使ったツール名）を、Desktop Commander（remote-devices 経由）で Mac の `~/workspace/agentic-solution/logs/cloud/raw/<日付>_<セッションID>.md` へ追記する mod です。Mac がオフラインで書き込みに失敗した分は、次のターンでまとめて再送します。

書き込み先は `hooks/register.ts` の `BASE` で変更できます。

## Install

At the prompt of a terminal session:

```
/plugin install cloud-log-to-mac --marketplace YuyaTakahashi/cloud-log-to-mac
```

From a shell:

```
claude plugin install cloud-log-to-mac --marketplace YuyaTakahashi/cloud-log-to-mac
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `YuyaTakahashi/cloud-log-to-mac`, then Add plugin.
