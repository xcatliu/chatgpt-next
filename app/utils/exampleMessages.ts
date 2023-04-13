export const exampleMessages: any = [
  {
    role: 'user',
    content: 'github actions 如何在修改某些文件时不触发',
  },
  {
    role: 'assistant',
    content:
      'GitHub Actions 中可以通过配置“忽略文件”来避免在某些文件修改时触发 Workflow。\n\n具体的操作步骤为：\n\n1. 在仓库根目录创建 `.github/workflows` 文件夹\n\n2. 在该文件夹下创建一个名为 `your-workflow.yml` 的 Workflow 文件，例如：\n\n   ```yaml\n   name: Your Workflow\n   on:\n     push:\n       branches:\n         - master\n   jobs:\n     your-job:\n       runs-on: ubuntu-latest\n       steps:\n         - name: Do something\n           run: echo "Hello, world!"\n   ```\n   \n3. 在 `your-workflow.yml` 文件的 `on` 字段下的 `push` 事件中添加 `paths` 字段，示例如下：\n\n   ```yaml\n   name: Your Workflow\n   on:\n     push:\n       branches:\n         - master\n       paths:\n         - \'!**/file1.txt\'\n         - \'!**/dir/file2.txt\'\n   jobs:\n     your-job:\n       runs-on: ubuntu-latest\n       steps:\n         - name: Do something\n           run: echo "Hello, world!"\n   ```\n\n   注意： \n\n   `paths` 字段可以配置一个或多个文件或目录路径，支持 `*` 和 `**` 通配符。\n\n   在 `paths` 中以 `!` 开头的路径表示排除不需要监视的文件或目录。\n\n   在示例中，`!**/file1.txt` 和 `!**/dir/file2.txt` 表示不监视项目根目录下的 `file1.txt` 文件和 `dir` 目录下的 `file2.txt` 文件。\n\n   如果没有特殊要求，也可以不使用 `paths` 字段，这样 Workflow 将监视全部文件及目录变化，包括触发 Workflow 的文件修改事件。',
  },
];
