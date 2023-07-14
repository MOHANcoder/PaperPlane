let totalJumps = 0;
const bgImage = new Image();
bgImage.src = "../assets/forest.jpg";

const pipeImage = new Image();
pipeImage.src = "../assets/wood.jpg";
const birdImage = new Image();
birdImage.src = "../assets/paperplane.png";

let pipes = {
    up: [],
    down: [],
    coins: []
};

window.onload = function () {

    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const PIPEWIDTH = canvasWidth / 24;

    class Pipe {
        constructor(width) {
            this.width = width;
            this.height = Math.random() * (canvasHeight / 2 - 2 * bird.r);
            this.start = {
                x: canvasWidth,
                y: 0
            };
            this.speed = 50;
            this.color = "violet";
            this.isCrossedByBird = false;
        }

        invert() {
            this.start.y = canvasHeight - this.height;
        }

        isHitOrScreenOut(x, y, w, h) {

            if (this.start.x < x + w && this.start.x + this.width >= x && this.start.y + this.height >= y && this.start.y <= y + h) {
                 alert("Game over!\nScore = "+score);
                totalJumps = 0;
                reStart(this.start);
            }

            if (this.start.x + this.width < 0) {
                return true;
            }
            return false;

        }


        isEnteredTheScreen() {
            return (
                this.start.x + this.width <= canvasWidth - this.width / 2
            );
        }


        update(timePassed) {

            this.speed += pipeMovingSpeed * timePassed;
            //pipeMovingSpeed+=0.05;
            //this.width+=0.005;
            this.start.x -= (this.speed * timePassed);
            if ((!this.isCrossedByBird) && this.start.x + this.width < bird.x) {
                score++;
                this.isCrossedByBird = true;
            }
        }


        show() {

            context.beginPath();
            context.drawImage(pipeImage, this.start.x, this.start.y, this.width, this.height);
            // context.rect(this.start.x,this.start.y,this.width,this.height);
            // context.fillStyle = this.color;
            context.fill();
        }
    }

    class Bird {
        constructor() {
            this.r = canvasHeight / 12;
            this.x = canvasWidth / 2 - this.r;
            this.y = canvasHeight / 2;
            this.dir = 0;
            this.speed = 20;
        }

        fly() {
            this.dir = 1;
        }

        stopFlying() {
            this.dir = 0;
        }

        update(timePassed) {
            if (this.dir == 1) {
                if (this.y > 0)
                    this.y -= (this.speed * timePassed);
            } else if (this.y <= canvasHeight - this.r) {
                this.speed += 10 * timePassed;
                this.y += (this.speed * timePassed);
            }

            if (this.y > canvasHeight - this.r || this.y <= 0) {
                //console.log(this.y);
                totalJumps = 0;

            }
        }

        show() {
            context.beginPath();
            //context.arc(this.x,this.y,this.r,0,2*Math.PI);           
           context.drawImage(birdImage,this.x,this.y,this.r,this.r); 
           //context.rect(this.x, this.y, this.r, this.r);
            context.fillStyle = "red";
            context.fill();
        }
    }

    function Coin(pipe, freeSpace) {
        this.radius = bird.r / 4;
        this.x = pipe.start.x;
        this.y = pipe.start.y + pipe.height + Math.floor(Math.random() * freeSpace - 2 * this.radius);
        this.isCollectedOrScreenOut = function (bird) {
            if (this.x + this.radius < 0) {
                return true;
            }
            
            if (bird.x < this.x + this.radius && bird.x + bird.r >= this.x-this.radius && this.y + this.radius >= bird.y && this.y-this.radius <= bird.y + bird.r) {
                score += 100;
                return true;
            }

            return false;
        }

        this.moveOnXAxis = function (dx) {
            this.x += dx;
        }

        this.show = function () {
            context.beginPath();
            context.fillStyle = "yellow";
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fill();
        }
    }


    var bird = new Bird();



    let t = Date.now();





    document.ontouchstart = window.onkeydown = function () {
        bird.fly();
        totalJumps++;

    }


    document.ontouchend = window.onkeyup = function () {
        bird.stopFlying();
    }



    pipes.up.push(new Pipe(PIPEWIDTH));
    let p = new Pipe(PIPEWIDTH);
    p.invert();
    pipes.down.push(p);
    pipes.coins.push(new Coin(p, canvasHeight - pipes.up.at(-1).height - pipes.down.at(-1).height));


    function draw() {

        let timePassed = (Date.now() - t) / 1000;
        t = Date.now();

        let fps = Math.round(1 / timePassed);
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);



        bird.show();
        bird.update(timePassed);

        pipes.up.forEach((pipe, i) => {
            if (pipe.isHitOrScreenOut(bird.x, bird.y, bird.r, bird.r)) {
                pipes.up.splice(i, 1);
                delete pipe;
                return;
            }
            pipe.show();
            pipe.update(timePassed);
        });

        pipes.down.forEach((pipe, i) => {
            if (pipe.isHitOrScreenOut(bird.x, bird.y, bird.r, bird.r)) {
                pipes.down.splice(i, 1);
                delete pipe;
                return;
            }
            pipe.show();
            pipe.update(timePassed);
        });

        pipes.coins.forEach((coin, i) => {
            if (coin.isCollectedOrScreenOut(bird)){
                pipes.coins.splice(i,1);
                delete coin;
                return;
            }
            coin.moveOnXAxis(-pipes.up[i].speed*timePassed);
            coin.show();
        });

        if (pipes.up.at(-1).isEnteredTheScreen()) {
            pipes.up.push(new Pipe(PIPEWIDTH));
            pipes.down.push(new Pipe(PIPEWIDTH));
            pipes.down.at(-1).invert();
            pipes.coins.push(new Coin(pipes.up.at(-1), canvasHeight - pipes.up.at(-1).height - pipes.down.at(-1).height));

        }

        showInfoPanel();
        window.requestAnimationFrame(draw);
    }

    draw();

    function reStart(msg) {
        pipes.up.forEach(pipe => delete pipe);
        pipes.down.forEach(pipe => delete pipe);
        pipes.coins.forEach(coin => delete coin);
        pipes = {
            up: [],
            down: [],
            coins:[]
        };

        delete bird;
        bird = new Bird();
        score = 0;
        totalJumps = 0;
        pipeMovingSpeed = 0;
        pipes.up.push(new Pipe(PIPEWIDTH));
        pipes.down.push(new Pipe(PIPEWIDTH));
        pipes.down.at(-1).invert();
        pipes.coins.push(new Coin(pipes.up.at(-1), canvasHeight - pipes.up.at(-1).height - pipes.down.at(-1).height));
    }

    function showInfoPanel() {
        context.beginPath();
        context.font = "60% Arial";
        context.fillStyle = "white";
        context.fillText("Jumps : " + totalJumps, 20, canvasHeight / 12);
        //context.fillText("FPS : "+fps,20,60);
        //context.fillText("Y : "+y,20,90);
        context.fillText("Score : " + score, 20, canvasHeight / 12 + 20);
    }

}



var score = 0;
var pipeMovingSpeed = 0.05;
