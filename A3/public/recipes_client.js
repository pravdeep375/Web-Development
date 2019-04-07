const ENTER = 13
function handleKeyUp(e){
    if (e.which == ENTER) {
        handleGetRecipesButton() //treat ENTER key like you would a submit
        
      }
}

function handleGetRecipesButton() {
    let userText = $('#userTextField').val();
    $('#userTextField').val('') //clear the user text field
    if(userText && userText!=''){
        sendPost(userText.trim(),"getRecipes")
        
         
        
    }
}

function sendPost (ingredient, routeType) {
    if(!ingredient){
        //do nothing
    }
    else{
        let userRequestObj = {
            type: routeType,
            text: ingredient
        } //make object to send to server
        let userRequestJSON = JSON.stringify(userRequestObj) //make JSON string
        //send post message to server
        console.log(ingredient)
        console.log(routeType)
        console.log(userRequestObj)
        console.log(userRequestJSON)
        $.post(routeType, userRequestJSON, function(data, status){
            $('#heading').replaceWith("<h1 id='heading'>Loading Recipes...</h1>")
            displayRecipes(data, status);
            $('#heading').replaceWith("<h1 id='heading'>Recipes for: "+ ingredient +"</h1>")
        })
    }    
}

function displayRecipes (data, status){
    console.log("data: " + data)
    console.log("typeof: " + typeof data)

    let resObj = JSON.parse(data)
    
    if(resObj){
        //remove old recipe infomation being displayed
        $('#recipeData').empty();

        //templating html table
        let template =  $('#Element').html();
        let templateScrpit = Handlebars.compile(template)
        let html =  ""
        let k=30;
        for(let j=0;j<resObj.count;j+=3){
            //NOTE: i=j and i<j+3 and j+=3
            for(let i=j; i<j+3;i++){
                let context = {"imgSrc":resObj.recipes[i].image_url,
                "recipeHref":resObj.recipes[i].f2f_url,
                "recipeName":resObj.recipes[i].title}

                html += templateScrpit(context)
            }
                $('#recipeData').append("<tr>"+html+"</tr>");
                html = ""
        }
        
    }
}


$(document).ready(function(){
    let parsedUrl = new URL(window.location.href);
    if (parsedUrl.searchParams.get('ingredient')!="") {
        sendPost(parsedUrl.searchParams.get('ingredient'),"getRecipes");
        console.log(parsedUrl.origin+parsedUrl.pathname)
        window.history.replaceState({},"foo",parsedUrl.origin+parsedUrl.pathname)
    }

    $(document).keyup(handleKeyUp)
});