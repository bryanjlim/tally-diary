export default class EntryStyling {
    static styles = theme => ({

        // Background
        paper: {
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: 1600,
            minWidth: '50px',
            paddingBottom: '5em',
            [theme.breakpoints.down('xs')]: {
                marginLeft: '-2em',
                marginTop: '-2em',
            },
        },

        // Title
        customTitleWrapper: {
            [theme.breakpoints.down('sm')]: {
                width: '95%',
                marginLeft: '1em'
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

        // Top Cluster (Add Tally/Todo Buttons, Date Selector)
        topCluster: {
            marginTop: '-4.7em',
            marginRight: '1em',
            float: 'right',
            [theme.breakpoints.down('sm')]: {
                marginTop: '.5em',
                marginLeft: '1em',
                float:'left',
                display:'inline-block'
            },
        },
        addButton: {
            marginTop: '1em',
            float: 'right',
            [theme.breakpoints.down('sm')]: {
                marginTop: '.5em',
                marginRight: '1em',
            }, 
        },
        hideWhenSmall: {
            [theme.breakpoints.down('sm')]: {
                display: 'none',
            },  
        },
        hideWhenBig: {
            [theme.breakpoints.up('md')]: {
                display: 'none',
            },  
        },

        // Body Text
        bodyTextWrapper: {
            marginLeft: '1em',
            width: '75%'
        },
        bodyText: {
            width: '100%',
        },

        // Bottom Cluster (Weather and Mood)
        bottomClusterGridContainer: {
            width: '80%',
            [theme.breakpoints.down('sm')]: {
                width: '95%',
            },  
        },
        bottomClusterObject: {
            marginTop: '1em',
            marginLeft: '1em',
            display: 'inline-block'
        }, 

        // Tally Marks and Todos
        spaceDivider: {
            marginTop: '1em',
        },
        chipHeader: {
            marginLeft: '1em',
            fontSize: '1.5em',
            color:theme.palette.primary.main,
        },
        noChipText: {
            marginLeft: '1.5em',
        }, 

        // Submit Button
        submitButton: {
            marginTop: '1em',
            marginRight: '1em',
            marginBottom: '1em',
            float: 'right',
        },
        sendIcon: {
            marginBottom: '.1em',
            marginLeft: '.5em',
        },
        backButton: {
            marginTop: '1em',
            marginLeft: '1em',
            marginBottom: '1em',
            float: 'left',
        },

      });
}