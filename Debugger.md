# Webstorm Debugger

## Setup

All server code must have an `.es6` extension.

### FileWatcher
Import the following file watcher rules.

#### Option #1: Manually Copy the following configuartion


![](/other/webstorm-debugger-1.png)

#### Option #2: Import XML

Import [watcher.xml](/other/watcher.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<TaskOptions>
  <TaskOptions>
    <option name="arguments" value="$FileDir$/$FileNameWithoutExtension$.compiled.js $FilePath$" />
    <option name="checkSyntaxErrors" value="true" />
    <option name="description" value="Transpiles ECMAScript 6 code to ECMAScript 5" />
    <option name="exitCodeBehavior" value="ERROR" />
    <option name="fileExtension" value="es6" />
    <option name="immediateSync" value="true" />
    <option name="name" value="Babel" />
    <option name="output" value="$FileDir$/$FileNameWithoutExtension$.compiled.js:$FileDir$/$FileNameWithoutExtension$.compiled.js.map" />
    <option name="outputFilters">
      <array />
    </option>
    <option name="outputFromStdout" value="false" />
    <option name="program" value="$ProjectFileDir$/tasks/babel-cli.js" />
    <option name="scopeName" value="Project Files" />
    <option name="trackOnlyRoot" value="false" />
    <option name="workingDir" value="$FileDir$" />
    <envs>
      <env name="PATH" value="/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/X11/bin:/opt/local/bin:/Users/mkurian/.nvm/versions/node/v5.0.0/bin" />
    </envs>
  </TaskOptions>
</TaskOptions>
```

![](/other/webstorm-debugger-2.png)


### Ignore Files
Append the following line `;*.compiled.js;*.compiled.js.map;`

![](/other/webstorm-debugger-0.png)

### Tips

Run the transformer on the entire directory by selecting the root directory in the `Project Explorer` and then pressing `Ctrl+Shift+A` and then type `Run File Watchers`


## Debug

Just select the a breakpoint on `.es6` file and run the `.compiled.js` version. Be sure to press the debug button and not the normal `play` button.
