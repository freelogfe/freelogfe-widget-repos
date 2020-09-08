## freelog-alpha-aside

This project was bootstrapped with [@freelog/freelog-cli](https://github.com/freelogfe/freelogfe-lib-repos/tree/master/packages/%40freelog/cli).

### Available Scripts

In the project directory, you can run:

#### `npm run dev`

Runs the app in the development mode.<br />
Open [http://localhost:9180](http://localhost:9180) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `build` folder.<br />
Your app is ready to be deployed!

### Usage
```html
<freelog-alpha-aside
  expand-btn-visible-alway
  list-type="['markdown']"
  is-multi-content
  content-widget-name="freelog-alpha-markdownviewer"
></freelog-alpha-aside>
```

#### Options
##### `expand-btn-visible-alway`: Boolean

Whether the expand button is always displayed

##### `list-type`: Array
The type of resource that the sidebar loads

##### `is-multi-content`: Boolean
Support for multiple content

##### `content-widget-name`: String
The name of the widget used by the content area

