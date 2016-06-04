node_modules/babel-cli/bin/babel.js --plugins transform-react-jsx sondages/static/js/main.jsx > sondages/static/js/main.babel.js

node_modules/browserify/bin/cmd.js sondages/static/js/main.babel.js > sondages/static/js/main.full.js

postcss --use stylefmt sondages/static/css/flex.css -r