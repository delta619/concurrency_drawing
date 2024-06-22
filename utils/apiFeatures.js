class APIFeatures{

    constructor(query , queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        let queryObj = {...this.queryString};
        const excludedFields = ["page", "sort", "limit", "fields"]
        
        excludedFields.forEach(el=> {
        delete queryObj[el];
        })

        this.queryString = JSON.stringify(queryObj);
        this.queryString = this.queryString.replace(/\b(gt|gte|lt|lte)\b/g , word=>`$${word}` );
        queryObj = JSON.parse(this.queryString);
    
        this.query = this.query.find(queryObj)
        
        return this;
    }

    sort(){ 
        
        if(this.queryString.sort)
        {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy); 
        }
        else{
            this.query = this.query.sort('-createdAt')   
        }
        return this
    }

    limitFields(){
        
        if(this.queryString.fields){
            this.query = this.query.select(this.queryString.fields.split(',').join(' '));
        }else{
            this.query = this.query.select("-__v")
        }
        return this;
    }

    paginate(){
        let page = this.queryString.page * 1 || 1;
        let limit = this.queryString.limit * 1 || 1000;

        let skip = ((page-1) *limit);
        
        this.query = this.query.skip(skip).limit(limit)
 
        return this
    }
}
module.exports = APIFeatures;