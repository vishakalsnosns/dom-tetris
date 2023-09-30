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
            grid_data[`${x},${y}`] = 'empty'
        }
    }
    return [grid_html, grid_data]
}
function CreateHoldGrid(){
    let hold_div = document.getElementById("hold-grid")
    let hold_height = 4
    let hold_width = 6
    
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

//global grid
[play_domgrid, play_colgrid] = CreatePlayGrid()
hold_domgrid = CreateHoldGrid()


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
            console.log(del_coords[i])
            play_domgrid[CoordToString(del_coords[i])].style.backgroundColor = empty_color
        
        }
    }



    return new_coords
}
//REPLACE WITH SWITCH x2 !! ; in the Ready function ; offset -1 in y for update specifications
const starting_coords = {
    "T": [[3,0],[4,0],[5,0],[4,-1]],
    "I": [[3,-1],[4,-1],[5,-1],[6,-1]],
    "J": [[5,-1],[3,0],[4,0],[5,0]],
    "L": [[3,-1],[3,0],[4,0],[5,0]],
    "O": [[4,-1],[5,-1],[4,0],[5,0]],
    "S": [[3,0],[4,0],[4,-1],[5,-1]],
    "Z": [[4,0],[5,0],[3,-1],[4,-1]]
}

//engine logic
//runs once to prepare State object

const fall_rate = 60
function Ready(){
    //prepare variables to pass into the State object

    let bag = ShuffleBag()
    active = bag[0]
    bag.splice(0, 1)

    let State = {
        bag: bag,
        active_piece: active,
        active_coords: starting_coords[active],
        frames_until_fall: fall_rate
    }
    Update(State)
}

//runs recursively on 60fps to manipulate and rerender State object to DOM
function Update(State){
    //destructure the State object to use in the function
    let {bag, active_piece, active_coords, frames_until_fall} = State

    //edit State
    //make the piece fall every 60 frames
    if (frames_until_fall == 0){
        //edit piece position
        active_coords = FallPiece(active_coords)
        
        //put piece on screen
        PaintPiece(active_piece, active_coords)

        //reset for continual delay
        frames_until_fall = fall_rate
    }
    

    frames_until_fall = frames_until_fall - 1



    //update state
    State = {
        bag: bag,
        active_piece: active_piece,
        active_coords: active_coords,
        frames_until_fall: frames_until_fall
    }

    window.requestAnimationFrame(function() {
        Update(State)
    })
}
Ready()