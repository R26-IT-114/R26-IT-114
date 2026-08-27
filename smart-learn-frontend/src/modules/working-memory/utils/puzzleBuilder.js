export const buildPuzzlePieces=(image,pieceCount=4)=>{

if(!image) return [];


const layouts = pieceCount===6 ?

[
"0% 0%",
"50% 0%",
"100% 0%",
"0% 100%",
"50% 100%",
"100% 100%"
]

:

[
"0% 0%",
"100% 0%",
"0% 100%",
"100% 100%"
];


return layouts.map((pos,index)=>({

id:`piece-${index+1}`,
targetId:`piece-${index+1}`,
backgroundPosition:pos,
image:image.image,
label:image.label

}));

}