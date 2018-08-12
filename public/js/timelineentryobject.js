class TimelineEntryObject{
    constructor(title, date, post, mood, tags, link){
        this.title = title;
        this.date = date; 
        this.post = post; 
        this.mood = mood;
        this.tags = tags; 
        this.link = link; 
    }

    toString(){
        return("TITLE:"+this.title+" DATE:"+this.date+" POST:"+this.post+" Tags:"+this.tags+" MOOD:"+this.mood); 
    }      
}