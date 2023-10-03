const grid_div = document.getElementById("play-grid")
const hold_div = document.getElementById("hold-grid")

//setup logic
//returns data for DOM editing (grid_html) ; collision detection (grid_coldata)
function CreatePlayGrid(){
    let grid_height = 21
    let grid_width = 10
    
    let grid_html = {}
    let grid_data = {}

    for(let x=0; x<grid_width; x++){
        grid_data[`${x},0`] = 'no block'
    }
    
    for(let y=1; y<grid_height; y++){
        let grid_row = document.createElement('tr')
        grid_div.appendChild(grid_row)

        for(let x=0; x<grid_width; x++){
            let grid_column = document.createElement('td')
            grid_column.id = `${x},${y}`

            //store board elements
            grid_row.appendChild(grid_column)
            grid_html[`${x},${y}`] = document.getElementById(`${x},${y}`)
            grid_data[`${x},${y}`] = '0'
        }
    }
    return [grid_html, grid_data]
}
function CreateHoldGrid(){
    let hold_div = document.getElementById("hold-grid")
    let hold_height = 4
    let hold_width = 5
    
    let hold_html = {}
    for(let y=0; y<hold_height; y++){
        let hold_row = document.createElement('tr')
        hold_div.appendChild(hold_row)
    
        for(let x=0; x<hold_width; x++){
            let hold_column = document.createElement('td')
            hold_column.id = `${x},${y}-hold`
            
            hold_row.appendChild(hold_column)
            hold_html[`${x},${y}`] = document.getElementById(`${x},${y}-hold`)
        }
    }
    return hold_html
}
function CreateNextGrid(){
    let next_div = document.getElementById("next-grid")
    let next_height = 4
    let next_width = 5
    
    let next_html = {}
    for(let y=0; y<next_height; y++){
        let next_row = document.createElement('tr')
        next_div.appendChild(next_row)
    
        for(let x=0; x<next_width; x++){
            let next_column = document.createElement('td')
            next_column.id = `${x},${y}-next`
            
            next_row.appendChild(next_column)
            next_html[`${x},${y}`] = document.getElementById(`${x},${y}-next`)
        }
    }
    return next_html
}

//global grid
[play_domgrid, play_colgrid] = CreatePlayGrid()
hold_domgrid = CreateHoldGrid()
next_domgrid = CreateNextGrid()



//render logic
function CoordToString(coord){
    return JSON.stringify(coord).replace("[", "").replace("]", "")
}

//REPLACE WITH SWITCH !! in the PaintPlayCoord function
const piece_colors = {
    "T": "purple",
    "I": "cyan",
    "J": "blue",
    "L": "orange",
    "O": "yellow",
    "S": "blue",
    "Z": "red"
}
const empty_color = "rgb(30, 30, 30)"

//the reason why i wrote the last 75 lines
function PaintPiece(active_piece, active_coords){
    for (let i=0; i<active_coords.length; i++){
        if (active_coords[i][1] > 0){
            play_domgrid[CoordToString(active_coords[i])].style.backgroundColor = piece_colors[active_piece]
        }
    }
}

//game logic
//7-bag implement ; ensure a re-execution and appending when 4 pieces are left for seamless bag cycling
function ShuffleBag(){
    let pieces = ['T', 'I','J', 'L', 'O', 'S', 'Z']
    let bag = []
    while(pieces.length > 0){
        let index = Math.floor(Math.random() * (pieces.length))
    
        bag.push(pieces[index])
        pieces.splice(index, 1)
    }
    return bag
}

function FallPiece(active_coords){
    let new_coords = []
    for (let i=0; i<active_coords.length; i++){
        new_coords = [...new_coords, [active_coords[i][0] ,active_coords[i][1] + 1]]
    }

    //get everything in active_coords that is not part of the intersection of active_coords and new_coords
    //push to del_coords to be wiped
    let del_coords = []
    for (let i=0; i<active_coords.length; i++){

        let prev_coord = active_coords[i]
        let matches = 0

        for (let j=0; j<new_coords.length; j++){
            let new_coord = new_coords[j]

            if (JSON.stringify(prev_coord) === JSON.stringify(new_coord)){
                matches = 1
            }
        }

        if (matches === 0){
            del_coords = [...del_coords, prev_coord]
        }
    }

    for (let i=0; i<del_coords.length; i++){
        if (del_coords[i][1] > 0){
            play_domgrid[CoordToString(del_coords[i])].style.backgroundColor = empty_color
        }
    }



    return new_coords
}

const large_piece_coords = {
    "T": ["2,1","2,2","1,2","3,2"],
    "I": ["2,0", "2,1","2,2","2,3"],
    "J": ["1,1","1,2","2,2","3,2"],
    "L": ["2,1","3,1","1,1","1,2"],
    "O": ["1,1","2,1","2,2","1,2"],
    "S": ["1,2","2,2","2,1","3,1"],
    "Z": ["1,1","2,1","2,2","3,2"]
}
function PaintNext(piece){
    for (let i=0; i<4; i++){
        next_domgrid[large_piece_coords[piece][i]].style.backgroundColor = piece_colors[piece]
    }
}
function ClearNext(){
    for(let x=0; x<5; x++){
        for(let y=0; y<4; y++){
            next_domgrid[`${x},${y}`].style.backgroundColor = empty_color
        }
    }
}

//REPLACE WITH SWITCH x2 !! ; in the Ready function ; offset -1 in y for update specifications
const starting_coords = {
    "T": [[3,1],[4,1],[5,1],[4,0]],
    "I": [[3,0],[4,0],[5,0],[6,0]],
    "J": [[5,0],[3,1],[4,1],[5,1]],
    "L": [[3,0],[3,1],[4,1],[5,1]],
    "O": [[4,0],[5,0],[4,1],[5,1]],
    "S": [[3,1],[4,1],[4,0],[5,0]],
    "Z": [[4,1],[5,1],[3,0],[4,0]]
}

//engine logic
//runs once to prepare State object
let fall_rate = 60
const frames_until_next_piece = 60
function Ready(){
    //prepare variables to pass into the State object

    let bag = ShuffleBag()
    active = bag[0]
    next = bag[1]
    bag.splice(0, 2)

    let State = {
        bag: bag,
        active_piece: active,
        active_coords: starting_coords[active],
        next_piece: next,
        frames_until_fall: fall_rate,
        can_fall: true,
        first_soft_drop_down: false,
        landing_time: frames_until_next_piece
    }

    
    Update(State)
}

//controls
let drop_key_down = false
let left_key_down = false
let right_key_down = false
let soft_drop_key_down = false
//button press event listeners
document.addEventListener("keydown", (button) => {
    let key = button.code
    //drop button pressed
    switch (key){
        case "Space":
            drop_key_down = true
            break
        case "ArrowDown":
            soft_drop_key_down = true
            break
        case "ArrowLeft":
            left_key_down = true
            break
        case "ArrowRight":
            right_key_down = true
            break
    }
})
document.addEventListener("keyup", (button) =>{
    let key=button.code
    switch (key){
        case "Space":
            drop_key_down = false
            break
        case "ArrowDown":
            soft_drop_key_down = false
            break
        case "ArrowLeft":
            left_key_down = false
            break
        case "ArrowRight":
            right_key_down = false
            break
    }
})

//runs recursively on 60fps to manipulate and rerender State object to DOM
function Update(State){
    //UNPACK VARIABLES
    let {bag, active_piece, active_coords, next_piece, frames_until_fall, can_fall, first_soft_drop_down, landing_time} = State
    if (landing_time == 0){
        //RESET STATE VARIABLES DUE TO NEW PIECE
        
        //add collision coordinates
        for (let i=0; i<4; i++){
            play_colgrid[CoordToString([active_coords[i][0], active_coords[i][1]])] = "1"
        }

        //cycle the pieces
        active_piece = next_piece
        active_coords = starting_coords[active_piece]

        next_piece = bag[0]
        bag.splice(0,1)
        if (bag.length < 2){
            ShuffleBag().map((e)=>{
                bag.push(e)
            })
        console.log(bag)
        }
        
        //clear next
        ClearNext()
        PaintNext(next_piece)

        //reset timers
        can_fall = true
        frames_until_fall = 60
        landing_time = 60
    }


    //y-movement

    if (soft_drop_key_down && !first_soft_drop_down && can_fall){
        first_soft_drop_down = true
    }
    else if (frames_until_fall == 0 && can_fall || first_soft_drop_down && can_fall){
        active_coords = FallPiece(active_coords)
        
        if (soft_drop_key_down){
            frames_until_fall = 2
        }
        else{
            frames_until_fall = fall_rate
        }
        first_soft_drop_down = false
    }
    else if(!can_fall && landing_time > 0){
        landing_time = landing_time - 1
    }
    frames_until_fall = frames_until_fall - 1

    //cases when the piece cant fall ; edits the can_fall variable to false to prevent the piece from falling
    for(let i=0; i<active_coords.length; i++){
        let this_coord = active_coords[i]
        if (this_coord[1] == 20 || play_colgrid[CoordToString([this_coord[0],this_coord[1]+1])] == "1"){
            can_fall = false
        }
    }

    //hard dropping
    

    //RENDER--------------------------

    PaintPiece(active_piece, active_coords)
    PaintNext(next_piece)


    //UPDATE STATE--------------------


    State = {
        bag: bag,
        active_piece: active_piece,
        active_coords: active_coords,
        next_piece: next_piece,
        frames_until_fall: frames_until_fall,
        can_fall: can_fall,
        first_soft_drop_down: first_soft_drop_down,
        landing_time: landing_time
    }
    
    window.requestAnimationFrame(function() {
        Update(State)
    })
}
Ready()