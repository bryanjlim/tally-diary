export default class EntryStyling {
    static styles = theme => ({

        // Background
        paper: {
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: 1600,
            paddingBottom: '5em',
            marginBottom: '2em',
            [theme.breakpoints.down('xs')]: {
                marginLeft: '-1em',
                marginTop: '-1em',
            },
        },

        // Title
        customTitleWrapper: {
            [theme.breakpoints.down('sm')]: {
                minWidth: 0,
                width: '95%',
                marginLeft: '1em'
            },
            [theme.breakpoints.up('md')]: {
                marginLeft: '1em',
                width: '75%',
            },
            '@media (max-width: 420px)': { 
                marginLeft: '.5em',
            },
        },
        customTitleAdornment: {
            color: theme.palette.primary.main,
            marginRight: '10px',
            userSelect: 'none',  
            fontSize: '2em',     
            [theme.breakpoints.down('sm')]: {
                fontSize: '1.5em',
            },      
            '@media (max-width: 420px)': { 
                fontSize: '1.3em',
            },
            '@media (max-width: 360px)': { 
                fontSize: '1em',
                width: '35%',
            },
        },
        customTitleInput: {
            width: '100%',
            minWidth: 0, 
            marginTop: '1em',
            fontSize: '2em',
            [theme.breakpoints.down('sm')]: {
                fontSize: '1.5em',
            }, 
            '@media (max-width: 420px)': { 
                fontSize: '1.5em',
            },
            '@media (max-width: 380px)': { 
                fontSize: '1em',
            },
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
            '@media (max-width: 420px)': { 
                marginLeft: '.5em',
            },
        },
        addButton: {
            marginTop: '1em',
            float: 'right',
            [theme.breakpoints.down('sm')]: {
                marginTop: '.5em',
                marginRight: '1em',
            }, 
            '@media (max-width: 450px)': { 
                float: 'left',
                marginLeft: '.8em',
                marginRight: '0em',
            },
            '@media (max-width: 420px)': { 
                marginLeft: '.5em',
            },
        },
        verticalButtonCluster: {
            [theme.breakpoints.down('sm')]: {
                display: 'none',
            },  
        },
        horizontalButtonCluster: {
            [theme.breakpoints.up('md')]: {
                display: 'none',
            },  
            '@media (max-width: 450px)': {
                marginTop: '4em',
            },
        },

        // Body Text
        bodyTextWrapper: {
            marginLeft: '1em',
            width: '75%',
            [theme.breakpoints.down('sm')]: {
                width: '95%'
            },  
            '@media (max-width: 420px)': { 
                marginLeft: '.5em',
            },
        },
        bodyText: {
            width: '100%',
        },

        // Bottom Cluster (Weather and Mood)
        bottomClusterGridContainer: {
            width: '95%',
            [theme.breakpoints.down('sm')]: {
                width: '95%',
            },  
        },
        bottomClusterObject: {
            marginTop: '1em',
            marginLeft: '1em',
            display: 'inline-block',
            '@media (max-width: 420px)': { 
                marginLeft: '.5em',
            },
        }, 
        moodSelector: {
            marginTop: '1em',
            marginLeft: '1em',
            display: 'inline-block',
            '@media (max-width: 600px)': {
                marginRight: '70%', 
            },
            '@media (max-width: 420px)': { 
                marginLeft: '.5em',
            },
        },

        // Tally Marks and Todos
        spaceDivider: {
            marginTop: '1em',
        },
        chipHeader: {
            marginLeft: '1em',
            fontSize: '1.5em',
            color:theme.palette.primary.main,
            '@media (max-width: 420px)': { 
                marginLeft: '.5em',
                fontSize: '1.2em',
            },
        },
        noChipText: {
            marginLeft: '1.5em',
            '@media (max-width: 420px)': { 
                marginLeft: '.75em',
                fontSize: '.9em'
            },
        }, 

        // Submit Button
        submitButton: {
            marginTop: '1em',
            marginRight: '1em',
            marginBottom: '1em',
            float: 'right',
            [theme.breakpoints.down('xs')]: {
                width: '130px',
                fontSize: '.8em',
            },
        },
        sendIcon: {
            marginBottom: '.1em',
            marginLeft: '.5em',
            [theme.breakpoints.down('xs')]: {
                width: '20px',
            },
        },
        backButton: {
            marginTop: '1em',
            marginLeft: '1em',
            marginBottom: '1em',
            float: 'left',
            [theme.breakpoints.down('xs')]: {
                width: '130px',
                fontSize: '.8em',
            },
            '@media (max-width: 420px)': { 
                marginLeft: '.5em',
            },
        },

      });
}