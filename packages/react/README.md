# Transifex Native for React

React component for localizing React application using [Transifex Native](https://www.transifex.com/native/).

Related packages:
* [@transifex/native](https://www.npmjs.com/package/@transifex/native)
* [@transifex/cli](https://www.npmjs.com/package/@transifex/native)

## Install

Install the library and its dependencies using:

```npm install @transifex/native @transifex/react --save```

## Usage

```jsx
import React, { Component } from 'react'

import T from '@transifex/react'

class Example extends Component {
  render() {
    const user = 'Joe';
    return (
      <div>
        <T _str="Hello world" />
        <T _str="Hello {username}" username={user} />
        <T
          _str="Hello <b>{username}</b>"
          _html
          username={user}
        />
        <p>
          <T
            _str="Hello <b>{username}</b>"
            _html _inline
            username={user}
          />
        </p>
      </div>
    )
  }
}
```

Available optional props:
| Prop       | Type   | Description                                 |
| ---------- | ------ | ------------------------------------------- |
| _context   | String | String context, affects key generation      |
| _comment   | String | Developer comment                           |
| _charlimit | Number | Character limit instruction for translators |
| _tags      | String | Comma separated list of tags                |
| _key       | String | Custom string key                           |



# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
