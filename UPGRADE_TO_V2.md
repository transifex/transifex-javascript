# Upgrade to v2

Transifex Native 2.x.x is the next major release after 1.x.x,
containing the following **breaking changes**:

# Default key generation

Version 1.x.x is using hashed based keys by default, unless
custom keys are specified in the source strings.

This behaviour changes in 2.x.x, where source based keys are used by default.

Use of source based keys, makes it easier to be managed by humans.

> Note: Use of custom keys via the `_key` property works as before.

**Before**

`t("Hello World")` will generate a hash based key:

`a3d9f5d6966e2909b0616f038568c18f -> Hello World`

**After**

`t("Hello World")` will generate a source based key:

`Hello World -> Hello World`

# Key discovery in @transifex/native

During runtime, `t` function (or `T` React component etc), will follow a new pattern for key discovery. For example:

`t("Hello World")`
- Look for `Hello World` key in the translated content
- Look for `hash("Hello World")` in the translated content (backwards compatibility)
- Trigger missing policy and/or display the source string

# @transifex/cli push command

Push command in CLI, will now push source based keys by default. This can be controled using the `--key-generator` flag.

For example:

`txjs-cli push src/ --key-generator=hash` (1.x.x mode)

`txjs-cli push src/ --key-generator=source` (2.x.x, the default)

# @transifex/react useT hook

Behaviour of `useT` React hook has changed. It now returns a `t` function.

**Before**

```
export function MyView() {
  const message = useT("Hello World");

  return (
    <div>{{ message }}</div>
  );
}
```

**After**

```
export function MyView() {
  const t = useT();

  return (
    <div>{{ t("Hello World") }}</div>
  );
}
```

# Content migration

Content pushed in Transifex contains hashed based content. Here is a strategy on how to migrate the content after the upgrade:

Step 1: Push content again using source based keys and tag them as `v2`:

```
txjs-cli push --append-tags=v2
```

Step 2: Let Translation Memory fill-up the translations in Transifex.

Step 3: Go to Transifex Editor and edit source language.

Step 4: Filter strings that DO NOT contain the `v2` tag.

Step 5: Mass select and delete them.

# Maintaining 1.x.x compatibility

Code wise, only the use of `useT` in the React SDK has changed and requires code migration.

To maintain backwards compatibity, simply use the

```txjs-cli push --key-generator=hash```

flag when pushing source content and you should be good to go.
