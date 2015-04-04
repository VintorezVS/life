/*var plan = ["############################",
    "#      #    #      o      ##",
    "#                          #",
    "#          #####           #",
    "##         #   #    ##     #",
    "###           ##     #     #",
    "#           ###      #     #",
    "#   ####                   #",
    "#   ##       o             #",
    "# o  #         o       ### #",
    "#    #                     #",
    "############################"];*/

function Vector(x, y) {
    this.x = x;
    this.y = y;
}
Vector.prototype.plus = function (other) {
    return new Vector(this.x + other.x, this.y + other.y);
};

function Grid(width, height) {
    this.space = new Array(width * height);
    this.width = width;
    this.height = height;
}
Grid.prototype.isInside = function (vector) {
    return vector.x >= 0 && vector.x < this.width &&
        vector.y >= 0 && vector.y < this.height;
};
Grid.prototype.get = function (vector) {
    return this.space[vector.x + this.width * vector.y];
};
Grid.prototype.set = function (vector, value) {
    this.space[vector.x + this.width * vector.y] = value;
};

var directions = {
    "n": new Vector(0, -1),
    "ne": new Vector(1, -1),
    "e": new Vector(1, 0),
    "se": new Vector(1, 1),
    "s": new Vector(0, 1),
    "sw": new Vector(-1, 1),
    "w": new Vector(-1, 0),
    "nw": new Vector(-1, -1)
};

var directions2 = {
    "d1": new Vector(-2, -2),
    "d2": new Vector(-1, -2),
    "d3": new Vector(0, -2),
    "d4": new Vector(1, -2),
    "d5": new Vector(2, -2),
    "d6": new Vector(2, -1),
    "d7": new Vector(2, 0),
    "d8": new Vector(2, 1),
    "d9": new Vector(2, 2),
    "d10": new Vector(1, 2),
    "d11": new Vector(0, 2),
    "d12": new Vector(-1, 2),
    "d13": new Vector(-2, 2),
    "d14": new Vector(-2, 1),
    "d15": new Vector(-2, 0),
    "d16": new Vector(-2, -1)
};

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

var directionNames = "n ne e se s sw w nw".split(" ");

var directionNames2 = "d1 d2 d3 d4 d5 d6 d7 d8 d9 d10 d11 d12 d13 d14 d15 d16".split(" ");

function BouncingCritter() {
    this.direction = randomElement(directionNames);
};

BouncingCritter.prototype.act = function (view) {
    if (view.look(this.direction) != " ")
        this.direction = view.find(" ") || "s";
    return {type: "move", direction: this.direction};
};

function elementFromChar(legend, ch) {
    if (ch == " ")
        return null;
    var element = new legend[ch]();
    element.originChar = ch;
    return element;
}

function World(map, legend) {
    var grid = new Grid(map[0].length, map.length);
    this.grid = grid;
    this.legend = legend;

    map.forEach(function (line, y) {
        for (var x = 0; x < line.length; x++)
            grid.set(new Vector(x, y),
                elementFromChar(legend, line[x]));
    });
}

function charFromElement(element) {
    if (element == null)
        return " ";
    else
        return element.originChar;
}

World.prototype.toString = function () {
    var output = "";
    for (var y = 0; y < this.grid.height; y++) {
        for (var x = 0; x < this.grid.width; x++) {
            var element = this.grid.get(new Vector(x, y));
            output += charFromElement(element);
        }
        output += "\n";
    }
    return output;
};

function Wall() {
}
/*
var world = new World(plan, {
    "#": Wall,
    "o": BouncingCritter
});
//   #      #    #      o      ##
//   #                          #
//   #          #####           #
//   ##         #   #    ##     #
//   ###           ##     #     #
//   #           ###      #     #
//   #   ####                   #
//   #   ##       o             #
//   # o  #         o       ### #
//   #    #                     #
//   ############################*/

Grid.prototype.forEach = function (f, context) {
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            var value = this.space[x + y * this.width];
            if (value != null)
                f.call(context, value, new Vector(x, y));
        }
    }
};

World.prototype.turn = function () {
    var acted = [];
    this.grid.forEach(function (critter, vector) {
        if (critter.act && acted.indexOf(critter) == -1) {
            acted.push(critter);
            this.letAct(critter, vector);
        }
    }, this);
};

World.prototype.letAct = function (critter, vector) {
    var action = critter.act(new View(this, vector));
    if (action && action.type == "move") {
        var dest = this.checkDestination(action, vector);
        if (dest && this.grid.get(dest) == null) {
            this.grid.set(vector, null);
            this.grid.set(dest, critter);
        }
    }
};

World.prototype.checkDestination = function (action, vector) {
    if (directions.hasOwnProperty(action.direction)) {
        var dest = vector.plus(directions[action.direction]);
        if (this.grid.isInside(dest))
            return dest;
    }
};

function View(world, vector) {
    this.world = world;
    this.vector = vector;
}
View.prototype.look = function (dir) {
    var target = this.vector.plus(directions[dir]);
    if (this.world.grid.isInside(target))
        return charFromElement(this.world.grid.get(target));
    else
        return "#";
};

View.prototype.look2 = function (dir) {
    var target = this.vector.plus(directions2[dir]);
    if (this.world.grid.isInside(target))
        return charFromElement(this.world.grid.get(target));
    else
        return "#";
};

View.prototype.findAll = function (ch) {
    var found = [];
    for (var dir in directions)
        if (this.look(dir) == ch)
            found.push(dir);
    return found;
};
View.prototype.find = function (ch) {
    var found = this.findAll(ch);
    if (found.length == 0) return null;
    return randomElement(found);
};

View.prototype.findAll2 = function (ch) {
    var found = [];
    for (var dir in directions2)
        if (this.look2(dir) == ch)
            found.push(dir);
    return found;
};
View.prototype.find2 = function (ch) {
    var found = this.findAll2(ch);
    if (found.length == 0) return null;
    return randomElement(found);
};

function dirPlus(dir, n) {
    var index = directionNames.indexOf(dir);
    return directionNames[(index + n + 8) % 8];
}

function WallFollower() {
    this.dir = "s";
}

WallFollower.prototype.act = function (view) {
    var start = this.dir;
    if (view.look(dirPlus(this.dir, -3)) != " ")
        start = this.dir = dirPlus(this.dir, -2);
    while (view.look(this.dir) != " ") {
        this.dir = dirPlus(this.dir, 1);
        if (this.dir == start) break;
    }
    return {type: "move", direction: this.dir};
};

function LifelikeWorld(map, legend) {
    World.call(this, map, legend);
}
LifelikeWorld.prototype = Object.create(World.prototype);

var actionTypes = Object.create(null);

LifelikeWorld.prototype.letAct = function (critter, vector) {
    var action = critter.act(new View(this, vector));
    var handled = action &&
        action.type in actionTypes &&
        actionTypes[action.type].call(this, critter,
            vector, action);
    if (!handled) {
        //critter.energy -= 0.2;
        if (critter.energy <= 0);
        //this.grid.set(vector, null);
    }
};

actionTypes.grow = function (critter) {
    critter.energy += 0.5;
    return true;
};

actionTypes.move = function (critter, vector, action) {
    var dest = this.checkDestination(action, vector);
    if (dest == null ||
        critter.energy <= 1 ||
        this.grid.get(dest) != null)
        return false;
    //critter.energy -= 1;
    this.grid.set(vector, null);
    this.grid.set(dest, critter);
    return true;
};

actionTypes.eat = function (critter, vector, action) {
    var dest = this.checkDestination(action, vector);
    var atDest = dest != null && this.grid.get(dest);
    if (!atDest || atDest.energy == null)
        return false;
    critter.energy += atDest.energy;
    this.grid.set(dest, null);
    return true;
};

actionTypes.reproduce = function (critter, vector, action) {
    var baby = elementFromChar(this.legend,
        critter.originChar);
    var dest = this.checkDestination(action, vector);
    if (dest == null ||
        critter.energy <= 2 * baby.energy ||
        this.grid.get(dest) != null)
        return false;
    critter.energy -= 2 * baby.energy;
    this.grid.set(dest, baby);
    return true;
};

function Plant() {
    this.energy = 3 + Math.random() * 4;
}
Plant.prototype.act = function (context) {
    if (this.energy > 15) {
        var space = context.find(" ");
        if (space)
            return {type: "reproduce", direction: space};
    }
    if (this.energy < 20)
        return {type: "grow"};
};

function PlantEater() {
    this.energy = 20;
}

function dirFromVector(vector) {
    for (var key in directions) {
        if (directions[key].x == vector.x && directions[key].y == vector.y) return key;
    }
}

PlantEater.prototype.act = function (context) {
    var space = context.find(" ");
    if (!space) return;
    if (this.energy > 60 && space);
    //return {type: "reproduce", direction: space};
    var bull = context.find("O");
    if (bull) {
        return {type: "move", direction: space};
    }
    else {
        var bulls = context.findAll2("O");
        if (bulls.length != 0) {
            for (var i in bulls) {
                var dir = new Vector(directions2[bulls[i]].x, directions2[bulls[i]].y);
                if (dir.x == 2) dir.x = 1;
                if (dir.y == 2) dir.y = 1;
                if (dir.x == -2) dir.x = -1;
                if (dir.y == -2) dir.y = -1;
                if (context.look(dirFromVector(dir)) == ' ')
                    return {type: "move", direction: dirFromVector(dir)};
            }
            return {type: "move", direction: space};
        }
        else
            return {type: "move", direction: space};
    }
    //return {type: "eat", direction: plant};
};


var prioritetindex=[0.1,0.96,1];		//значение приоритета
function prioritet(arr,num){			//приоритет рандома того или иного символа в массиве simv
var max=num;							//arr-массив simv; mun-рандомное число от 0 до 1
for (var i=0;i<arr.length;i++){			//значение имеет разница между левым и правым числом, например
    if (arr[i]>=max)					//рандомное число 0,25-max, идет проверка 0,1>0,25?, нет 0,25-max,
    {max=arr[i]							//0,96>0.25?, да 0,96-max, 
    return i;							//возвращает индекс max, для данного примера индекс=1
    }									//в случае если в prioritetindex все чила<max, возвращает индекс 
    if (max>=arr[arr.length-1]){max=arr[arr.length-1]} //последнего элемента
}}

var simv=["#"," ","O"];					//символы из которых составляется карта
function newarray(one,leng){			//one,leng-высота и ширина карты
var map=[];
for(var i=0;i<one;i++){
    map[i]=[];
    for(var j=0;j<leng;j++){  
        if(i==0||i==one-1||j==0||j==leng-1){	//рисует стену вокруг карты
            map[i]+="#";}
		else if(map[i-1][j]=="#"||map[i][j-1]=="#"){
           map[i]+=simv[prioritet([0.3,0.9,1],Math.random())]
        }
		else map[i]+=simv[prioritet(prioritetindex,Math.random())];	//рисует рандомный (в зависимости от приоритета) символ из simv 
    };
};  
    return map;
};

var mas1=newarray(20,30);			//создает карту(масив масивов) заданой величины
var valley = new LifelikeWorld(
    mas1,
    {"#": Wall,
        "O": PlantEater}
);
