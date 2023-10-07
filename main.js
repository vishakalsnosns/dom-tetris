const grid_div = document.getElementById("play-grid")
const hold_div = document.getElementById("hold-grid")

//returns data for DOM editing and collision detection ; play grid
function CreatePlayGrid(){
    let grid_height = 21
    let grid_width = 10
    
    let grid_html = {}
    let grid_data = {}

    for(let x=0; x<grid_width; x++){
        grid_data[`${x},0`] = '0'
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

//returns data for DOM editing ; hold grid
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

//returns data for DOM editing ; next grid
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

//global grid variables created
[play_domgrid, play_colgrid] = CreatePlayGrid()
hold_domgrid = CreateHoldGrid()
next_domgrid = CreateNextGrid()


//returns colors
const piece_colors = {
    "T": "#A000F0",
    "I": "#00F0F0",
    "J": "#0000F0",
    "L": "#F0A000",
    "O": "#F0F000",
    "S": "#00F000",
    "Z": "#F00000",
    "NA": "rgb(30, 30, 30)"
}

//colors a play grid coordinate with the respective color
function PaintPiece(active_piece, active_coords){
    for (let i=0; i<active_coords.length; i++){
        if (active_coords[i][1] > 0){
            play_domgrid[CoordToString(active_coords[i])].style.backgroundColor = piece_colors[active_piece]
        }
    }
}

//colors a play grid coordinate with no color
function DeleteCoords(coords){
    for (let i=0; i<coords.length; i++){
        if (coords[i][1] > 0){
            play_domgrid[CoordToString(coords[i])].style.backgroundColor = piece_colors["NA"]
        }
    }
}

//color pieces onto the next grid
function PaintNext(piece){
    //clear next
    for(let x=0; x<5; x++){
        for(let y=0; y<4; y++){
            next_domgrid[`${x},${y}`].style.backgroundColor = piece_colors["NA"]
        }
    }

    //paint next
    let coords;
    switch (piece){
        case "T":
            coords = ["2,1","2,2","1,2","3,2"]
            for (let i=0; i<4; i++){
                next_domgrid[coords[i]].style.backgroundColor = piece_colors["T"]
            }
            break
        case "I":
            coords = ["2,0", "2,1","2,2","2,3"]
            for (let i=0; i<4; i++){
                next_domgrid[coords[i]].style.backgroundColor = piece_colors["I"]
            }
            break
        case "J":
            coords = ["1,1","1,2","2,2","3,2"]
            for (let i=0; i<4; i++){
                next_domgrid[coords[i]].style.backgroundColor = piece_colors["J"]
            }
            break
        case "L":
            coords = ["2,1","3,1","1,1","1,2"]
            for (let i=0; i<4; i++){
                next_domgrid[coords[i]].style.backgroundColor = piece_colors["L"]
            }
            break
        case "O":
            coords = ["1,1","2,1","2,2","1,2"]
            for (let i=0; i<4; i++){
                next_domgrid[coords[i]].style.backgroundColor = piece_colors["O"]
            }
            break
        case "S":
            coords = ["1,2","2,2","2,1","3,1"]
            for (let i=0; i<4; i++){
                next_domgrid[coords[i]].style.backgroundColor = piece_colors["S"]
            }
            break
        case "Z":
            coords = ["1,1","2,1","2,2","3,2"]
            for (let i=0; i<4; i++){
                next_domgrid[coords[i]].style.backgroundColor = piece_colors["Z"]
            }
            break
    }
}


//returns shuffled 7-bag
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

//returns intersection of two arrays
function GetIntersection(first_coords, second_coords){
    let intersection = []
    for (let i=0; i<first_coords.length; i++){
        
        let matches = 0

        for (let j=0; j<second_coords.length; j++){
            if (JSON.stringify(first_coords[i]) === JSON.stringify(intersection[j])){
                matches = 1
                break
            }
        }

        if (matches === 0){
            intersection = [...intersection, first_coords[i]]
        }
    }
    return intersection
}

//converts coordinate [x, y] into "x,y" ; for interacting with grid associative arrays
function CoordToString(coord){
    return JSON.stringify(coord).replace("[", "").replace("]", "")
}

//returns translated piece -1 in y
function FallPiece(active_coords){
    for(let i=0; i<4; i++){
        if (active_coords[i][1] == 20 || play_colgrid[CoordToString([active_coords[i][0], active_coords[i][1]+1])] == "1"){
            return active_coords
        }
    }
    let new_coords = []
    for (let i=0; i<active_coords.length; i++){
        new_coords = [...new_coords, [active_coords[i][0] ,active_coords[i][1] + 1]]
    }

    let del_coords = GetIntersection(active_coords, new_coords)

    DeleteCoords(del_coords)

    return new_coords
}

//returns translated piece +/-1 in x
function XMovePiece(active_coords, direction){
    for(let i=0; i<4; i++){
        let this_coord = active_coords[i]
        if (this_coord[0] == 0 || play_colgrid[CoordToString([this_coord[0]-1, this_coord[1]])] == "1"){
            if (direction == -1){
                return active_coords
            }
        }
        if (this_coord[0] == 9 || play_colgrid[CoordToString([this_coord[0]+1, this_coord[1]])] == "1"){
            if (direction == 1){
                return active_coords
            }
        }
    }

    let new_coords = []
    for (let i=0; i<4; i++){

        new_coords = [...new_coords, [active_coords[i][0] + direction, active_coords[i][1]]]

    }
    
    let del_coords = GetIntersection(active_coords, new_coords)

    DeleteCoords(del_coords)

    return new_coords
}

function CheckFallCollision(active_coords){
    let prev = active_coords
    if (JSON.stringify(FallPiece(active_coords)) != JSON.stringify(prev)){
        return true
    }
    return false
}

function CheckLeftCollision(active_coords){
    let prev = active_coords
    if (JSON.stringify(XMovePiece(active_coords, -1) != JSON.stringify(prev))){
        return true
    }
    return false
}

function CheckRightCollision(active_coords){
    let prev= active_coords
    if (JSON.stringify(XMovePiece(active_coords, 1) != JSON.stringify(prev))){
        return true
    }
    return false
}


// functions (up) ; game engine (down)




const starting_coords = {
    "T": [[3,1],[4,1],[5,1],[4,0]],
    "I": [[3,0],[4,0],[5,0],[6,0]],
    "J": [[5,0],[3,1],[4,1],[5,1]],
    "L": [[3,0],[3,1],[4,1],[5,1]],
    "O": [[4,0],[5,0],[4,1],[5,1]],
    "S": [[3,1],[4,1],[4,0],[5,0]],
    "Z": [[4,1],[5,1],[3,0],[4,0]]
}

//controls layout
let soft_drop_key_down = false
let drop_key_down = false
let left_key_down = false
let right_key_down = false
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
    let key = button.code
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

//difficulty ; fall_rate
let fall_rate = 40
let x_move_rate = 2


//executes once
function Ready(){
    //prepare bag and pieces
    let bag = ShuffleBag()
    active = bag[0]
    next = bag[1]
    bag.splice(0, 2)

    let State = {
        bag: bag,                               //array of upcoming pieces
        active_piece: active,                   //piece under player control 
        active_coords: starting_coords[active], //array of coordinates to apply transformations
        next_piece: next,                       //piece appearing next
        frames_until_fall: fall_rate,           //timer for natural falling of pieces
        can_fall: true,                         //bool of whether piece can translate down
        landing_time: 60,                       //timer for time the piece can remain while can_fall is 0
        second_x_move_timer: 20,
        x_move_timer: x_move_rate
    }

    Update(State)
}

//executes every frame
function Update(State){
    //UNPACK VARIABLES
    let {bag, active_piece, active_coords, next_piece, frames_until_fall, can_fall, landing_time, second_x_move_timer, x_move_timer} = State
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
        }
        
        //paint next piece
        PaintNext(next_piece)

        //reset timers
        frames_until_fall = fall_rate
        can_fall = true
        landing_time = 30
        second_x_move_timer = 20
    }

    // x-movements
    let left_and_right_down = left_key_down && right_key_down

    if ((left_key_down || right_key_down) && !(left_and_right_down)){

        if (second_x_move_timer == 20){
            if (left_key_down){
                active_coords = XMovePiece(active_coords, -1)
            }
            else if (right_key_down){
                active_coords = XMovePiece(active_coords, 1)
            }
            second_x_move_timer = second_x_move_timer - 1
        }
        else if (second_x_move_timer == 0){
            if (x_move_timer == 0){
                if (left_key_down){
                    active_coords = XMovePiece(active_coords, -1)
                }
                else if (right_key_down){
                    active_coords = XMovePiece(active_coords, 1)
                }

                x_move_timer = x_move_rate
                
            }
            x_move_timer = x_move_timer - 1

        }
        else{
            second_x_move_timer = second_x_move_timer - 1
        }
    }
    else{
        second_x_move_timer = 20
        x_move_timer = x_move_rate
    }
    
    //y-movement
    can_fall = CheckFallCollision(active_coords)
    if (can_fall && soft_drop_key_down && frames_until_fall > 5){frames_until_fall = 5}
    if (can_fall && frames_until_fall == 0){
        active_coords = FallPiece(active_coords)
        if (soft_drop_key_down){
            frames_until_fall = 5
        }
        else{
            frames_until_fall = fall_rate
        }
        landing_time = 60
    }
    else if (!can_fall){
        landing_time = landing_time - 1
        frames_until_fall = 30
    }

    frames_until_fall = frames_until_fall - 1

    

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
        landing_time: landing_time,
        second_x_move_timer: second_x_move_timer,
        x_move_timer: x_move_timer
    }
    
    window.requestAnimationFrame(function() {
        Update(State)
    })
}

Ready()