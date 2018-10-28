import React, {Component, Fragment } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Hidden, Drawer, CssBaseline, List, ListItem
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Menu } from '@material-ui/icons';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import 'typeface-roboto';

const drawerWidth = 240;

const styles = theme => ({
    root: {
      fontFamily: 'roboto',
      flexGrow: 1,
      height: 440,
      zIndex: 1,
      position: 'relative',
      display: 'flex',
      width: '100%',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    navIconHide: {
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      height: window.innerHeight,
      width: drawerWidth,
      [theme.breakpoints.up('md')]: {
        position: 'relative',
      },
    },
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing.unit * 3,
    },
  });

class Layout extends Component {
    state = {
        mobileOpen: false,
    }

    handleDrawerToggle = () => {
        this.setState({ mobileOpen: !this.state.mobileOpen });
    }

    render () {
        const { classes, location: { pathname }, children } = this.props;

        const drawer = (
          <div>
            <Hidden smDown>
                <div className={classes.toolbar} />
            </Hidden>
            <List>
                <ListItem component={Link} onClick={this.handleDrawerToggle} to='/' selected={'/' === pathname}>Add Entry</ListItem>
                <ListItem component={Link} onClick={this.handleDrawerToggle} to='/timeline' selected={'/timeline' === pathname}>My Entries</ListItem>
                <ListItem component={Link} onClick={this.handleDrawerToggle} to='/insights' selected={'/insights' === pathname}>Insights</ListItem>
                <ListItem component={Link} onClick={this.handleDrawerToggle} to='/settings' selected={'/settings' === pathname}>Settings</ListItem>
            </List>
          </div>
        );

        return (
            <Fragment>
                <CssBaseline/>
                <div className={classes.root}>
                    <AppBar position='absolute' className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                        color="inherit"
                        aria-label="Open drawer"
                        onClick={this.handleDrawerToggle}
                        className={classes.navIconHide}
                        >
                        <Menu />
                        </IconButton>
                        <Typography variant="title" color="inherit" noWrap>
                        Tally Diary
                        </Typography>
                    </Toolbar>
                    </AppBar>
                    <Hidden mdUp>
                    <Drawer
                        variant="temporary"
                        open={this.state.mobileOpen}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        style={{fontFamily: "roboto"}}
                        ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                    </Hidden>
                    <Hidden smDown implementation="css">
                    <Drawer
                        variant="permanent"
                        open
                        classes={{
                        paper: classes.drawerPaper,
                        }}
                    >
                        {drawer}
                    </Drawer>
                    </Hidden>
                    <main className={classes.content}>
                        <div className={classes.toolbar} />
                        {children}
                    </main>
                </div>
            </Fragment>
        );
    }
}

export default compose(
    withRouter, 
    withStyles(styles)
)(Layout)