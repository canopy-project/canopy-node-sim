var interval = null;
var innerInterval = null;
var count = 0;
var testCount = 2;
var innerCount = 0;
var innerTestCount = 5;

// Spin up testCount batches of innerTestCount

interval = setInterval(function(){
    if( count >= testCount ){
        clearInterval( interval );
    } else{
        count += 1;
        console.log('count: ' + count);
        innerCount = 0;
            innerInterval = setInterval(function(){
                if( innerCount >= innerTestCount){
                    clearInterval( innerInterval )
                } else {
                    innerCount += 1;
                    console.log('innerCount: ' + innerCount);
                }
        }, 10);
    }           
}, 1000);
