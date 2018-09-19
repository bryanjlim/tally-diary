export default class EntryStyling {
    static styles = theme => ({
        paper: {
            minWidth: '50px',
            paddingBottom: '3em',
            [theme.breakpoints.down('xs')]: {
                marginLeft: '-1em',
                marginTop: '-1em',
            },
        },
        customTitleWrapper: {
            
            [theme.breakpoints.down('sm')]: {
                width: '100%',
            },
            [theme.breakpoints.up('md')]: {
                marginLeft: '1em',
                width: '75%',
            },
        },
        customTitleAdornment: {
            color: theme.palette.primary.main,
            marginRight: '10px',
            userSelect: 'none',             
        },
        customTitleInput: {
            marginTop: '1em',
            width: '100%',
            overflowX: 'auto',
        },
        customTitleInputText: {
            fontSize: '1.5em',
        },
        topCluster: {
            marginTop: '-4.7em',
            marginRight: '1em',
            float: 'right',
            [theme.breakpoints.down('sm')]: {
                marginTop: '1em',
                float:'left',
                display:'inline-block'
            },
        },
        addTallyButton: {
            marginTop: '1em',
            float: 'right',
            [theme.breakpoints.down('sm')]: {
                marginTop: '0em',
                float:'right',
            },
        },
        addTodoButton: {
            marginTop: '1em',
            float: 'right',
            [theme.breakpoints.down('sm')]: {
                marginTop: '0em',
                float:'right',
            },
        },
        hideWhenSmall: {
            [theme.breakpoints.down('sm')]: {
                display: 'none',
            },  
        },
        bodyTextWrapper: {
            marginLeft: '1em',
            width: '75%'
        },
        bodyText: {
            width: '100%',
        }
      });
}