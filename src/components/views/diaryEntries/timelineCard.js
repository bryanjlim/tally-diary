import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import './timelineCard.css'

export class TimelineCard extends Component {
    render() {
        const entryDate = new Date(this.props.date);
        const daysAlive = Math.round((entryDate - new Date(this.props.birthDate)) / (1000 * 60 * 60 * 24));
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const readDate = months[entryDate.getMonth()] + " " + entryDate.getDate() + ", " + entryDate.getFullYear(); 
        
        return (
            <Card className='timelineCard'>
                <CardHeader
                    action={
                        <IconButton>
                        <MoreVertIcon />
                        </IconButton>
                    }
                    title= {"Day " + daysAlive + (this.props.title ? " - " + this.props.title : " ")}
                    subheader={readDate}
                />  
                <CardContent>
                    <Typography component="p">
                        {this.props.bodyText}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small">View Entry</Button>
                </CardActions>
            </Card>
        );

        // return (
        //     <div>
        //         <h2>Title: {this.props.title}</h2>
        //         <h2>Date: {this.props.date}</h2>
        //         <p>Mood: {this.props.mood.mood}</p>
        //         <p>Body: {this.props.bodyText}</p>
        //         <p>Tallies: {JSON.stringify(this.props.tallies)}</p>
        //         <p>Weather: {JSON.stringify(this.props.weather)}</p>
        //         <p>Days Alive: {Math.round((new Date(this.props.date) - new Date(this.props.birthDate)) / (1000 * 60 * 60 * 24))}</p>
        //         <span> </span>
        //     </div>
        // );
    }
}

export default TimelineCard;
