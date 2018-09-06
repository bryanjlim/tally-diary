import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import { App } from './components/app'
import { NotFound404 } from './components/pages/not_found_404/notFound404'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

ReactDOM.render(
    <Router>
        <Switch>
        <Route exact path="/" component={App}/>
        <Route path="*" component={NotFound404}/>
        </Switch>
    </Router>, document.getElementById('root')
);
registerServiceWorker();
