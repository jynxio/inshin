const Yeensin = require( "./YeensinPlus" );

const yeensin = Yeensin.all([
    1,
    new Yeensin( resolve => setTimeout( _ => resolve( 2 ), 0 ) ),
    3,
    Yeensin.resolve( 4 ),
    Yeensin.reject( 5 ),
]);

yeensin.then(
    v => console.log( v ),
    r => console.log( "reject" ),
);

console.log( "macrotask done" );
