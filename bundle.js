(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// The main program which acts as the interface between the user and the framework
// In order: 
// Contains the collection of steps required to generate one image of a chibi
// Contains the logic to process user input to customize a chibi
// Contains several animation functions to generate an animation based on a chibi

// import
const{Path} = require("./path.js") 
const{Util} = require("./util.js") 
const{Ref} = require("./ref.js") 
const{Generator} = require("./generator.js") 
const{createCanvas} = require('canvas')

//constants
radian = Math.PI / 180   // radian conversion
canvasWidth = 2000;
canvasHeight = 2000;
gen = new Generator()
util = new Util()

class Builder{
    constructor(){}
    //given a ref, create a chibi of it with a given file name
    create(ref, fileName, outputToMainDirectory = false, outputToFusionDirectory = false){
        
        //create
        canvas = createCanvas(canvasWidth, canvasHeight);
        ctx = canvas.getContext("2d");

        //background
        ctx.fillStyle = "#EEEEEE";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        render(ctx, ref, 500, 500)
        render(ctx, ref, -250, 750, 0.75)
        render(ctx, ref, 1000, 0, 0.5)
        render(ctx, ref, 250, 250, 0.25)
        render(ctx, ref, 980, 980, 0.01)
        render(ctx, ref, 940, 940, 0.025)

        // final draw and export
        const buffer = canvas.toBuffer("image/png");

        const fs = require("fs");
        outFileName = `./generatedImages/${fileName}.png`
        if(outputToMainDirectory){
            outFileName = `./${fileName}.png`
        }
        if(outputToFusionDirectory){
            outFileName = "./fusion/" + fileName + ".png"
        }
        fs.writeFileSync(outFileName, buffer);

        console.log("created " + outFileName)

        return outFileName
    }

    render(ctx, ref, offsetX=0, offsetY=0, scale=1.0){
        ref.updatePoints()
        
        //Brush style
        let lineWidth = ref.lineWidth;
        ctx.lineCap = 'round';

        // generate base potato head and draw
        let headPaths = gen.generateHeadPath(ref,ctx)
        let headPath = headPaths.headPath
        let headLRRef = headPaths.headLRRef
        let hairPath = headPaths.hairPath
        headPath.setFillStyle(ref.faceColor)
        headPath.addNoise(2,2,ref.drawSeed)
        headPath.smoothPoints()

        let leftRef = headLRRef.points[0]
        let rightRef = headLRRef.points[headLRRef.points.length-1]

        let bangPath = gen.generateHairBangs(ref, leftRef, rightRef, ctx)
        bangPath.reversePath()
        hairPath.addPath(bangPath)
        hairPath.addPoint(hairPath.points[0])

        hairPath.setFillStyle(ref.hairColor)
        hairPath.addNoise(2,2,ref.drawSeed)
        hairPath.smoothPoints()

        //generate face paths and draw
        let facePaths = gen.generateFacePaths(ref)

        headPath.draw(ctx, lineWidth, false, offsetX, offsetY, scale)
        hairPath.draw(ctx, lineWidth, false, offsetX, offsetY, scale)
        facePaths.forEach(path =>{
            path.addNoise(2,2,ref.drawSeed)
            path.smoothPoints()
            path.draw(ctx, lineWidth, false, offsetX, offsetY, scale)
        })
    }
}


module.exports = {
    Builder: Builder
}



// // user input system
// // ***
// const prompt = require("prompt-sync")({ sigint: true });
// userInput = "none"
// mode = "creation"
// firstPrompt = true
// setExpression = ""

// validMouthValues = []
// validEyeValues = []
// // saved ref
// let ref = new Ref(1000, 1000)

// // fuse test
// fuseChibis = []
// canFuse = []
// fusionsRemaining = 15

// // begin user input:
// while(userInput != "exit" && userInput != "quit"){
//     displayText = ""
//     if(mode == "creation"){ //define user prompt based on current page
//         if(firstPrompt){
//             displayText += "Welcome to chibiBot.js!" + "\n"
//             displayText += "The following is a random chibi:" + "\n"
//             displayText += "=====\n"
//             firstPrompt = false
//         }
//         displayText += "[0] Wideness:\t\t" + ref.widthScale + "\n"
//         displayText += "[1] Eye Wideness:\t" + ref.eyeSeperation + "\n"
//         displayText += "[2] Eye Height:\t\t" + ref.eyeHeight + "\n"
//         displayText += "[3] Mouth Height:\t" + ref.mouthHeight + "\n"
//         displayText += "[4] Hair Color:\t\t" + ref.hairColor + "\n"
//         displayText += "[5] Skin Color:\t\t" + ref.faceColor + "\n"
//         displayText += "[6] Seed (sets all values):\t\t" + ref.baseSeed + "\n"
//         displayText += "=====" + "\n"
//         displayText += "Enter a category number and a value to adjust any value, (e.g. '1 0.8' sets eye wideness to 0.8)" + "\n"
//         displayText += "or enter nothing to continue:"
//     }else if(mode == "pose"){
//         displayText += "Adjust the pose of your chibi!" + "\n"
//         displayText += "[0] Expression (preset [1-3] values):\t" + setExpression + "\n"
//         displayText += ">\t(0: happy, 1: angry, 2: sad, 3: surprised, 4: misc)" + "\n"
//         displayText += "[1] Mouth Style:\t" + ref.mouthStyle + "\n"
//         displayText += "[2] Eye Style:\t\t" + ref.eyeStyle + "\n"
//         displayText += "[3] Accessories:\t[" + ref.accessories + "]   (-1 to clear)\n"
//         displayText += "[4] Scale:\t\t" + ref.scale + "\n"
//         displayText += "[5] X Angle:\t\t" + ref.angleX + "\n"
//         displayText += "[6] Y Angle:\t\t" + ref.angleY + "\n"
//         displayText += "Or [7] to choose a preset animation!" + "\n"
//         displayText += "Or [8] to play fuse mode!" + "\n"
//         displayText += "=====" + "\n"
//         displayText += "Enter a category number and a value to adjust any value, (e.g. '4 138')" + "\n"
//         displayText += "or enter nothing to create an image of your chibi!:"
//     }else if(mode == "animation"){
//         displayText += "Choose an animation!" + "\n"
//         displayText += "[0/Default] Looking around:\n"
//         displayText += "[1] Bouncing Chibi:\n"
//         displayText += "[2] 40 Random Chibis:\n"
//         displayText += "[3] All Accessories:\n"
//         displayText += "[4] Fuse Test:\n"
//         displayText += "====="
//     }else if(mode == "fuse"){
//         displayText += "Give the number of any two chibis to fuse them!"
//     }else{
//         console.log("Something went wrong! Please try again!")
//         break;
//     }

//     console.log(displayText)
//     userInput = prompt("> Input: ");

//     // process userinput based on page and input value
//     args = userInput.split(" ")
//     if(args.length == 1 && args[0] == ''){ //empty input, move to next page or create
//         if(mode == "creation"){
//             mode = "pose"
//         }else if(mode == "pose"){
//             create(ref, "output", true)
//             break;
//         }else{
//             lookingAroundAnimation(ref)
//             break;
//         }
//     }else{
//         category = parseInt(args[0]) 
//         if(mode == "creation"){ //creation values
//             if(category == 0){
//                 value = parseFloat(args[1]) 
//                 ref.widthScale = Math.max(0.8, Math.min(1.6, value))
//                 ref.updateScale(ref.scale)
//             }else if(category == 1){
//                 value = parseFloat(args[1]) 
//                 ref.eyeSeperation = Math.max(0.3, Math.min(0.9, value))
//             }else if(category == 2){
//                 value = parseFloat(args[1]) 
//                 ref.eyeHeight = Math.max(-0.09, Math.min(-0.03, value))
//             }else if(category == 3){
//                 value = parseFloat(args[1]) 
//                 ref.mouthHeight = Math.max(-0.4, Math.min(-0.2, value))
//             }else if(category == 4){
//                 value = args[1]
//                 ref.hairColor = value
//             }else if(category == 5){
//                 value = args[1]
//                 ref.faceColor = value
//             }else if(category == 6){
//                 value = parseFloat(args[1])  //take seed and update
//                 ref.baseSeed = Math.floor(Math.max(0, Math.min(999999, value)))
//                 ref.setAllSeededValues(ref.baseSeed)
//             }
//         }else if(mode == "pose"){ //pose values
//             if(category == 0){
//                 value = parseInt(args[1]) 
//                 bigPresetList = [ 
//                     [[6,10,[]], [9,8,[]]], //happy presets
//                     [[1,102,[301]], [10,104,[]]], //angry presets
//                     [[7,106,[300]], [14,3,[]]], //sad presets
//                     [[5,0,[306]], [5,101,[]]], //surprised presets
//                     [[104,1,[]], [11,103,[304]]] //special presets
//                 ]
//                 subList = bigPresetList[value]
//                 randList = subList[Math.floor(subList.length * Math.random())]

//                 ref.mouthStyle = randList[0]
//                 ref.eyeStyle = randList[1]
//                 ref.accessories = randList[2]
//             }else if(category == 1){
//                 value = parseInt(args[1]) 
//                 ref.mouthStyle = value
//             }else if(category == 2){
//                 value = parseInt(args[1]) 
//                 ref.eyeStyle = value
//             }else if(category == 3){ //accessories addition or clearing
//                 value = parseInt(args[1]) 
//                 if(value == -1){
//                     ref.accessories = []
//                 }else{
//                     ref.accessories.push(value)
//                 }
//             }else if(category == 4){
//                 value = parseFloat(args[1]) 
//                 ref.scale = Math.max(50, Math.min(600, value))
//                 ref.updateScale(ref.scale)
//             }else if(category == 5){
//                 value = parseFloat(args[1]) 
//                 ref.angleX = Math.max(-20, Math.min(20, value))
//             }else if(category == 6){
//                 value = parseFloat(args[1]) 
//                 ref.angleY = Math.max(-25, Math.min(-5, value))
//             }else if(category == 7){
//                 mode = "animation"
//             }else if(category == 8){
//                 mode = "fuse"

//                 console.log("Initializing 16 Chibis!")
//                 for(let i = 0; i < 16; i++){
//                     fuseChibis.push(new Ref(1000, 1000))
//                     fuseChibis[i].updateScale(400)
//                     create(fuseChibis[i], i, false, true)
//                     canFuse.push(i)
//                 }
//             }
//         }else if(mode == "animation"){ // choose an animation
//             value = parseInt(args[0])
//             if(value == 0){
//                 lookingAroundAnimation(ref)
//             }else if(value == 1){
//                 bounceAnimation(ref)
//             }else if(value == 2){
//                 randomChibiAnimation(40)
//             }else if(value == 3){
//                 allAccessoriesAnimation(ref)
//             }else if(value == 4){
//                 fuseTest(ref)
//             }else{
//                 lookingAroundAnimation(ref)
//             }
//             break;
//         }else if(mode == "fuse"){
//             fusionsRemaining -= 1

//             fuse1 = parseInt(args[0])
//             fuse2 = parseInt(args[1])

//             //fuse chibis in random direction to ensure that there is absolutely no bias
//             if(Math.random() < 0.5){
//                 fuseChibis[fuse1].fuse(fuseChibis[fuse2])
//             }else{
//                 fuseChibis[fuse2].fuse(fuseChibis[fuse1])
//                 fuseChibis[fuse1] = fuseChibis[fuse2]
//             }

//             fuseChibis[fuse1].updateScale(400)
//             create(fuseChibis[fuse1], fuse1, false, true)

//             let fileName  = "./fusion/" + fuse2 + ".png"
//             fs.openSync(fileName, 'r');
//             fs.unlinkSync(fileName);
            
//             if(fusionsRemaining == 0){
//                 lookingAroundAnimation(fuseChibis[fuse1])
//                 break
//             }
//         }
//     }
//     console.log("=====")
// }

// //////
// //code for animation: looking around
// //////
// function lookingAroundAnimation(ref){
//     fileNames = []
//     nextFileName = 0
//     for(let x = -20; x <= 20; x += 4){
//         ref.angleX = x
//         ref.angleY = -5
//         imageFileName = create(ref, nextFileName)
//         fileNames.push(imageFileName)
//         nextFileName += 1
//     }
//     for(let y = -5; y >= -25; y -= 2){
//         ref.angleX = 20
//         ref.angleY = y
//         imageFileName = create(ref, nextFileName)
//         fileNames.push(imageFileName)
//         nextFileName += 1
//     }
//     for(let x = 20; x >= -20; x -= 4){
//         ref.angleX = x
//         ref.angleY = -25
//         imageFileName = create(ref, nextFileName)
//         fileNames.push(imageFileName)
//         nextFileName += 1
//     }
//     for(let y = -25; y <= -5; y += 2){
//         ref.angleX = -20
//         ref.angleY = y
//         imageFileName = create(ref, nextFileName)
//         fileNames.push(imageFileName)
//         nextFileName += 1
//     }
//     renderGif(fileNames, 5)
// }

// //////
// //code for animation: bouncing
// //////
// // //attempt at making an animation using the current setup
// function bounceAnimation(ref){
//     squishFrames = 0
//     fileNames = []
//     nextFileName = 0
//     ref.updateScale(200)
//     baseWidth = ref.width
//     baseHeight = ref.height

//     for(let x = 0; x < 0.5; x += 0.02){
//         let y = (1-4*x**2)
//         bounceAnim(x, y, ref, squishFrames, baseWidth, baseHeight, nextFileName, fileNames)
//         squishFrames -= 1
//         nextFileName += 1
//     }
//     squishFrames = 5
//     for(let x = 0.5; x < 0.86; x += 0.02){
//         let y = 0.5-(4*x-2.71)**2
//         bounceAnim(x, y, ref, squishFrames, baseWidth, baseHeight, nextFileName, fileNames)
//         squishFrames -= 1
//         nextFileName += 1
//     }
//     squishFrames = 5
//     for(let x = 0.86; x < 1.12; x += 0.02){
//         let y = 0.25-(4*x-3.92)**2
//         bounceAnim(x, y, ref, squishFrames, baseWidth, baseHeight, nextFileName, fileNames)
//         squishFrames -= 1
//         nextFileName += 1
//     }
//     squishFrames = 4
//     for(let x = 1.12; x < 1.2834; x += 0.02){
//         let y = 0.125-(4*x-4.78)**2
//         bounceAnim(x, y, ref, squishFrames, baseWidth, baseHeight, nextFileName, fileNames)
//         squishFrames -= 1
//         nextFileName += 1
//     }
//     squishFrames = 3
//     for(let x = 0; x < 20; x += 1){
//         bounceAnim(1.2834, 0.033333, ref, squishFrames, baseWidth, baseHeight, nextFileName, fileNames)
//         squishFrames -= 1
//         nextFileName += 1
//     }
//     for(let x = 0; x <= 1.2; x += 0.06){
//         zoomWoah(x, ref, squishFrames, baseWidth, baseHeight, nextFileName, fileNames)
//         squishFrames -= 1
//         nextFileName += 1
//     }

//     renderGif(fileNames, 5)
// }

// function bounceAnim(relX, relY, ref, inputSquish, baseWidth, baseHeight, nextFileName, fileNames){
//     let squish = Math.max(0, inputSquish)
//     ref.setCenter(relX*1246, 1800-(relY*1500)) 
//     ref.eyeStyle = 2
//     ref.mouthStyle = 7
//     if(squish > 0){
//         ref.eyeStyle = 8
//         ref.mouthStyle = 6
//     }
//     ref.width = baseWidth + squish*baseWidth/25
//     ref.height = baseHeight - squish*baseHeight/25
//     ref.angleX = 10-30*relX/1.28
//     ref.angleY = 10-30*relX/1.28
//     let imageFileName = create(ref, nextFileName)
//     fileNames.push(imageFileName)
// }

// function zoomWoah(relX, ref, squish, baseWidth, baseHeight, nextFileName, fileNames){
//     let rel = Math.min(relX, 1)
//     ref.centerX = util.prop(1600, 1000, rel)
//     ref.centerY = util.prop(1800, 1000, rel)
//     ref.eyeStyle = 101
//     ref.mouthStyle = 5
//     ref.updateScale(util.prop(200, 800, rel))
//     let imageFileName = create(ref, nextFileName)
//     fileNames.push(imageFileName)
// }

// //////
// // code for random chibi animation
// //////
// function randomChibiAnimation(amount){
//     fileNames = []
//     for(let i = 0; i < amount; i++){
//         let newRef = new Ref(1000, 1000)
//         fileNames.push(create(newRef, i))
//     }
//     renderGif(fileNames, 50)
// }

// //////
// // code for testing all accessories
// //////
// function allAccessoriesAnimation(ref){
//     fileNames = []
//     let acc = 0
//     for(let i = 0; i < ref.allAccessories.length; i++){
//         ref.accessories = []
//         ref.accessories.push(ref.allAccessories[i])
//         fileNames.push(create(ref, acc))
//         acc += 1
//     }
//     ref.accessories = []
//     for(let i = 0; i < ref.allEyes.length; i++){
//         ref.eyeStyle = ref.allEyes[i]
//         fileNames.push(create(ref, acc))
//         acc += 1
//     }
//     ref.eyeStyle = 0
//     for(let i = 0; i < ref.allMouths.length; i++){
//         ref.mouthStyle = ref.allMouths[i]
//         fileNames.push(create(ref, acc))
//         acc += 1
//     }
//     renderGif(fileNames, 50)
// }

// //////
// // code for testing all accessories
// //////

// function fuseTest(ref){
//     fileNames = []

//     let ref2 = new Ref(1000, 1000)
//     fileNames.push(create(ref, 0))
//     fileNames.push(create(ref2, 1))

//     ref.fuse(ref2)
//     fileNames.push(create(ref, 2))

//     renderGif(fileNames, 200)
// }

// ////
// // gif render
// ////

// function renderGif(fileNames, speed){
//     console.log("Rendering gif!")
//     // render gif
//     var Gm = require("gm");
//     const ref = require("./ref.js")
//     newGm = Gm()

//     fileNames.forEach( fileName =>{
//         newGm = newGm.in(fileName)
//     })
//     newGm.delay(speed)
//     .resize(2000,2000)
//     .write("out.gif", function(err){
//     if (err) throw err;
//     console.log("out.gif created");
//     });
// }


},{"./generator.js":2,"./path.js":7,"./ref.js":8,"./util.js":10,"canvas":5,"fs":11}],2:[function(require,module,exports){
//generator class:
//This class should be responsible for all the generations of paths, from simple lines/circles, to the complex head shapes and face expressions
//The inputs to the simple generation should be simple, and inputs for the complex shapes should only require a ref object to determine the major coordinates
const path = require("./path.js")
const{Path} = require("./path.js") 
const ref = require("./ref.js")
const{Util} = require("./util.js") 
util = new Util()

//constants
radian = Math.PI / 180   // radian conversion
class Generator{
    constructor(){}

    ///////
    //simple shape path generation: "P" variants use single point arguments while the other uses x,y arguments
    ///////
    generateLineP(point1, point2){
        return this.generateLine(point1[0], point1[1], point2[0], point2[1])
    }

    generateLine(x1,y1,x2,y2, strokeStyle="#000000"){
        let facePath = new Path(strokeStyle, "none")
        let linePointCount = Math.floor(Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))/10)+2 //15=segmet length
    
        for(let i=0; i<linePointCount;i++){
            let ratio = i/(linePointCount-1)
            facePath.addPoint([x1+(x2-x1)*ratio,y1+(y2-y1)*ratio])
        }
        return facePath
    }

    generateDotP(point, strokeStyle="#000000"){
        return this.generateCircle(point[0], point[1], 0.5, 0, strokeStyle)
    }

    generateDot(centerX, centerY, strokeStyle="#000000"){
        return this.generateCircle(centerX, centerY, 0.5, 0, strokeStyle)
    }

    generateCircleP(point, radius, protrusion=0, strokeStyle="#000000", fillStyle="none"){
        return this.generateOval(point[0], point[1], radius, radius, protrusion, strokeStyle, fillStyle)
    }
    
    generateCircle(centerX, centerY, radius, protrusion=0, strokeStyle="#000000", fillStyle="none"){
        return this.generateOval(centerX, centerY, radius, radius, protrusion, strokeStyle, fillStyle)
    }

    generateOvalP(point, radiusX, radiusY, protrusion=0, strokeStyle="#000000", fillStyle="none"){
        return this.generateOval(point[0], point[1], radiusX, radiusY, protrusion, strokeStyle, fillStyle)
    }
    
    //generate a set of points outlining a rounded square type of look
    //good protrusion for a face shape is 0.05
    generateOval(centerX, centerY, radiusX, radiusY, protrusion=0, strokeStyle="#000000", fillStyle="none"){
        let facePath = new Path(strokeStyle, fillStyle)
        facePath.makeCircular()
        let numPoints = Math.floor(((radiusX+radiusY)*3.1415)/10)+4
        let degreePerStep = 360/(numPoints-1)
        let dg = (numPoints-1)/8 //number of points before each diagonal is reached
        for(let i = 0; i < numPoints; i++){
            let protrude = 1 + protrusion * (Math.abs((i+dg)%(dg*2) - dg)/dg)
            let degree = i*radian*degreePerStep
            facePath.addPoint([centerX + Math.cos(degree)*radiusX*protrude, centerY + Math.sin(degree)*radiusY*protrude])
        }
        
        return facePath
    }

    generateOvalWonky(centerX, centerY, radiusX, radiusY, protrusion=0, strokeStyle="#000000", fillStyle="none"){
        let facePath = new Path(strokeStyle, fillStyle)
        facePath.makeCircular()
        let numPoints = Math.floor(((radiusX+radiusY)*3.1415)/10)+4
        let degreePerStep = 360/(numPoints-1)
        let dg = (numPoints-1)/14 
        for(let i = 0; i < numPoints; i++){
            let protrude = 1 + protrusion * (Math.abs((i+dg)%(dg*2) - dg)/dg)
            let degree = i*radian*degreePerStep
            facePath.addPoint([centerX + Math.cos(degree)*radiusX*protrude, centerY + Math.sin(degree)*radiusY*protrude])
        }
        
        return facePath
    }

    generatePartialOval(centerX, centerY, radiusX, radiusY, angle1, angle2, protrusion=0, strokeStyle="#000000", fillStyle="none"){
        let facePath = new Path(strokeStyle, fillStyle)
        let numPoints = Math.floor(((radiusX+radiusY)*3.1415)/10)+4 //num points for a full circle
        numPoints = Math.max(3, Math.floor(numPoints * (angle2-angle1)/360 + 1)) //num points for the specified arc
        let degreePerStep = (angle2-angle1)/(numPoints-1)
        let dg = (numPoints-1)/8/((angle2-angle1)/360) //number of points before each diagonal is reached
        for(let i = 0; i < numPoints; i++){
            let protrude = 1 + protrusion * (Math.abs((i+dg)%(dg*2) - dg)/dg)
            let degree = (i*degreePerStep + angle1)*radian
            facePath.addPoint([centerX + Math.cos(degree)*radiusX*protrude, centerY + Math.sin(degree)*radiusY*protrude])
        }
        
        return facePath
    }

    //generate an oval with start and end angles


    //generate a bezier curve based on 4 points
    //calculation method from https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/de-casteljau.html#:~:text=Following%20the%20construction%20of%20a,and%20finally%20add%20them%20together.
    // added arguments for hairline generation:
    //  forcePointNum forces the generated curve to have a set amount of points to decrease jitteryness when working with hairline points
    //  ratioBias should force more points to be to one side of the curve than the other: 0 = more points near ratio 0, 1 vice versa
    //  bias mode works better with more points (preferably > 10)

    generate4PointBezier(p1, p2, p3, p4, strokeStyle="#000000", forcePointNum="none", ratioBias=-1){
        let curvePath = new Path(strokeStyle, "none")
        let curveLength = ((util.dist(p1, p2) + util.dist(p3, p2) + util.dist(p3, p4)) + (util.dist(p1, p4)))/2 //an extremely generous estimation of the curve length, actual value takes an EXTREME amount of math to calculate
        let numPoints = forcePointNum
        if(numPoints == "none"){
            numPoints = Math.floor((curveLength)/10)+2 //num points for a full circle
        }else if(isNaN(numPoints)){
            throw "bezier curve force point num is not a valid input!"
        }

        // regularly, the generation is linear
        let ratioPerStep = 1.0/(numPoints-1)
        let ratio

        // with bias mode, calculate itegral over a specific part of a circle 
        let biasMode = ratioBias != -1
        let totalBiasIntegral = 0
        if(biasMode){
            for(let i = 0; i < numPoints-1; i++){
                totalBiasIntegral += this.circleBiasPoint(ratioBias, i/(numPoints-2))
            }
        }
        let biasProgress = 0

        //hardcoded way cause this is too much brain for me
        for(let i = 0; i < numPoints; i++){
            if(biasMode){
                if(i > 0) biasProgress += this.circleBiasPoint(ratioBias, (i-1)/(numPoints-2))
                ratio = biasProgress/totalBiasIntegral
            }else{
                ratio = ratioPerStep*i
            }

            let p1a = util.interpolatePoint(p1,p2,ratio)
            let p2a = util.interpolatePoint(p2,p3,ratio)
            let p3a = util.interpolatePoint(p3,p4,ratio)

            let p1b = util.interpolatePoint(p1a,p2a,ratio)
            let p2b = util.interpolatePoint(p2a,p3a,ratio)

            let pFinal = util.interpolatePoint(p1b,p2b,ratio)
            curvePath.addPoint(pFinal)
        }
        return curvePath
    }
    // helper for above function
    circleBiasPoint(bias, x){
        return Math.sqrt(1-((x-bias)**2))
    }

    //simpler 3 point version (no bias mode)
    generate3PointBezier(p1, p2, p3, strokeStyle="#000000"){
        let curvePath = new Path(strokeStyle, "none")
        let curveLength = ((util.dist(p1, p2) + util.dist(p3, p2)) + (util.dist(p1, p3)))/2 //an extremely generous estimation of the curve length, actual value takes an EXTREME amount of math to calculate
        let numPoints = Math.floor((curveLength)/10+2) //num points for a full circle

        // regularly, the generation is linear
        let ratioPerStep = 1.0/(numPoints-1)

        //hardcoded way cause this is too much brain for me
        for(let i = 0; i < numPoints; i++){
            let ratio = ratioPerStep*i

            let p1a = util.interpolatePoint(p1,p2,ratio)
            let p2a = util.interpolatePoint(p2,p3,ratio)

            let p1b = util.interpolatePoint(p1a,p2a,ratio)
            curvePath.addPoint(p1b)
        }
        return curvePath
    }




    
    /////
    //complex path generations: these generations take in a Ref object to form the shapes for the chibi
    /////

    // generate head path: returns a single path of the head shape for the given ref:
    // if a ctx is provided, a debug circle is drawn where the smudge areas area
    generateHeadPath(ref, ctx=null){
        //generate base oval for head shape
        let roundedness = util.propC(0.07,0,ref.headRoundedness)
        let headPath = this.generateOval(ref.centerX, ref.centerY, ref.width, ref.height, roundedness, "#222222")//, "#faeacf")

        // let hairPath = this.generateOval(ref.centerX, ref.centerY, ref.width*1.03, ref.height*1.03, roundedness, "#222222")//, "#faeacf")
        let hairPath = this.generatePartialOval(ref.centerX, ref.centerY, ref.width*1.04, ref.height*1.04, 180, 360, roundedness, "#222222")//, "#faeacf")

        //generate a line to keep track of left and right head reference points
        let hairRefHeightOffset = ref.height/7.5 * util.prop(0, 1, (ref.angleY+5.)/-20)
        let hairRefWidthOffset = ref.width/25.
        let headLRRef = this.generateLine(ref.HEAD_LEFT[0]-hairRefWidthOffset, ref.HEAD_LEFT[1]+hairRefHeightOffset, ref.HEAD_RIGHT[0]+hairRefWidthOffset, ref.HEAD_RIGHT[1]+hairRefHeightOffset)

        //chin smudge params (L): Drag edges of face downwards to form a chin shape
        let centerX = ref.HEAD_LEFT[0]
        let centerY = ref.HEAD_BOTTOM[1]
        let smudgeWidth = ref.width*1.2
        let smudgeHeight = ref.height
        let smudgeX = 0
        let smudgeY = util.prop(0,0.055,ref.chinBulge)
        
        
        this.smudgeAreas([headPath, hairPath, headLRRef],centerX, centerY, smudgeWidth, smudgeHeight, smudgeX, smudgeY)
        //chin smudge params (R)
        centerX = ref.HEAD_RIGHT[0]
        this.smudgeAreas([headPath, hairPath, headLRRef],centerX, centerY, smudgeWidth, smudgeHeight, smudgeX, smudgeY)
        //chin smudge params (correct for egregious butt chins that may form from the previous smudges)
        centerX = ref.HEAD_CENTER[0]
        smudgeY *= 0.8
        this.smudgeAreas([headPath, hairPath, headLRRef],centerX, centerY, smudgeWidth, smudgeHeight, smudgeX, smudgeY)

        //cheek smudge params: Drag the face in its direction to form a cheek bulge
        //cheek smudge is composed of a left smudge and right smudge, with a rightmost limit and leftmost limit respectively
        //smudge left
        let buldgeness = util.propC(0,-0.12,ref.cheekBulge) //smudge: range of 0-0.08, favor median 0.05
        if(buldgeness < -0.08){
            buldgeness = util.prop(0,-0.08,ref.cheekBulge)
        }
        let centerThreshold = util.prop(0.3,0.125,(ref.angleY+25)/25) //the limit changes depending on the y angle of the face
        centerX = Math.min(ref.centerX-ref.width*centerThreshold, ref.centerX-ref.width*Math.sin(ref.angleX*radian)*3)
        centerY = ref.HEAD_BOTTOM[1]
        smudgeWidth = ref.width*1.1
        smudgeHeight = ref.height*1.3
        smudgeX = buldgeness
        // console.log("anglex: " + ref.angleX)
        let minSmudge = 0.75 + (Math.abs(ref.angleY)-5)/20*0.15 //smudge can be as low as 0.75 when face is looking straight forward (about -5 = yAngle)
        let dimSmudge = Math.min(1, Math.abs(ref.angleX/40)+minSmudge) //diminish the cheek smudge if this side is looking close to center
        if(ref.angleX < 0) dimSmudge = minSmudge
        smudgeX *= dimSmudge
        smudgeY = 0
        // console.log("leftSmudge: " + dimSmudge + " , " + smudgeX)
        this.smudgeAreas([headPath, hairPath, headLRRef],centerX, centerY, smudgeWidth, smudgeHeight, smudgeX, smudgeY)

        //smudge right
        centerX = Math.max(ref.centerX+ref.width*centerThreshold, ref.centerX-ref.width*Math.sin(ref.angleX*radian)*3)
        smudgeX = buldgeness
        dimSmudge = Math.min(1, Math.abs(ref.angleX/40)+minSmudge)
        if(ref.angleX > 0) dimSmudge = minSmudge
        smudgeX *= dimSmudge*-1
        // console.log("rightSmudge: " + dimSmudge + " , " + smudgeX)
        this.smudgeAreas([headPath, hairPath, headLRRef], centerX, centerY, smudgeWidth, smudgeHeight, smudgeX, smudgeY)

        return {
            headPath: headPath,
            hairPath: hairPath,
            headLRRef: headLRRef
        };
    }

    //generate hair bangs by taking random segments from the top hairline and bottom hairline
    generateHairBangs(ref, headLeftPoint, headRightPoint, ctx=null){
        //generate hairlines: general offset and fixed point count
        let hairlineWidthOffset = ref.width/120 * ref.angleX * -1
        let hairlineHeightOffset = (-ref.height) * (1 - (ref.angleY/-25)*0.50) * util.prop(1,1.4,ref.hairlineHeight) // first height = hairline height/forehead size
        // hairlineHeightOffset *= 0.75 //attempt to reduce offset scale
        let hairlinePointCount = Math.floor(ref.width/200*40 + ref.height/200*10)
        let bezierExtendLX = Math.max(headLeftPoint[0], headLeftPoint[0]+hairlineWidthOffset+ref.width/5)
        let bezierExtendRX = Math.min(headRightPoint[0], headRightPoint[0]+hairlineWidthOffset-ref.width/5)

        //The term "bias" is used for weighings that account for head rotation in the hairline bezier curve
        //(changes the density of the generated bezier curve to favor points near start or end)
        let hairlineBias = util.prop(0.15,0.85,(ref.angleX+20)/40) 
        hairlineBias = Math.min(1,Math.max(0,hairlineBias))

        //generate hairlines
        let topHairline = this.generate4PointBezier(headLeftPoint, [bezierExtendLX,headLeftPoint[1]+hairlineHeightOffset], [bezierExtendRX,headRightPoint[1]+hairlineHeightOffset], headRightPoint, "#00000022", hairlinePointCount, hairlineBias)
        hairlineHeightOffset += ref.height*(util.prop(0.2,0.4,ref.hairLength)) // adjust height = hair length
        let flatHairline = this.generate4PointBezier(headLeftPoint, [bezierExtendLX,headLeftPoint[1]+hairlineHeightOffset], [bezierExtendRX,headRightPoint[1]+hairlineHeightOffset], headRightPoint, "#00000022", hairlinePointCount, hairlineBias)
        hairlineHeightOffset += ref.height*(util.prop(0.2,0.4,ref.hairLength)) // adjust height = hair length
        let bottomHairline = this.generate4PointBezier(headLeftPoint, [bezierExtendLX,headLeftPoint[1]+hairlineHeightOffset], [bezierExtendRX,headRightPoint[1]+hairlineHeightOffset], headRightPoint, "#00000022", hairlinePointCount, hairlineBias)
 
        let totalTopPoints = topHairline.points.length
        let totalBottomPoints = bottomHairline.points.length
        let totalFlatPoints = flatHairline.points.length

        // topHairline.draw(ctx, true)
        // flatHairline.draw(ctx, true)
        // bottomHairline.draw(ctx, true)

        // Top hair anchor generation:
        // - First, decide how many top segments are going to be generated
        // - Then split the value of 1 over each segment
        // - Then randomly adjust the value of edge-most segments by the same random weight
        // - Then randomly adjust the value of all segments by random weights
        // - Then reweight all segments to total 1

        // generate bangs based on hairline
        let bangLine = new Path("#000000")
        let flatBangMode = ref.isStraightBang <= 0.25

        // create an amount of top segments and give each an equal ratio
        let topSegmentCount = Math.floor(util.propC(1.8,3.35,ref.topAnchorCount))+1
        let avgDistribution = 1.0/topSegmentCount
        let segments = Array(topSegmentCount).fill(avgDistribution);
        // adjust the edge ratios equally by an amount
        let edgeSegmentAdjust = util.propC(0.3,1.5,ref.hairMiscRand[4])
        segments[0] *= edgeSegmentAdjust
        segments[topSegmentCount-1] *= edgeSegmentAdjust
        // randomly vary each segment's weight 
        for(let i = 0; i < topSegmentCount; i++){
            segments[i] *= util.propC(0.5,2,ref.hairMiscRand[i])
        }
        // recalculate segment ratios so everything adds up 1
        let total = segments.reduce((a, b) => a + b, 0)
        for(let i = 0; i < topSegmentCount; i++){
            segments[i] /= total
        }

        for(let i = 1; i < topSegmentCount; i++){
            segments[i] = segments[i-1]+segments[i]
        }

        //for each segment, generate a line
        if(flatBangMode){
            let segmentCount = 0 
            for(let i = 0; i < totalFlatPoints; i++){
                bangLine.addPoint(flatHairline.points[i])
                if(segmentCount < segments.length-1 && i/(totalFlatPoints-1) >= segments[segmentCount]){
                    if(segments[segmentCount] >= 0.1 && segments[segmentCount] <= 0.9){
                        let verticalLineLength = ref.height * util.prop(0.1,0.3,ref.bangSegmentRand[segmentCount][0]) * util.prop(0.5,1,(-5-ref.angleY)/20)
                        let verticalPoint = [flatHairline.points[i][0], flatHairline.points[i][1] - verticalLineLength]
                        let line = this.generateLineP(flatHairline.points[i], verticalPoint)
                        bangLine.addPath(line)
                        line = this.generateLineP(verticalPoint, flatHairline.points[i])
                        bangLine.addPath(line)
                    }
                    segmentCount += 1
                }
                bangLine.addPoint(flatHairline.points[i])
            }
        }else{
            let prevPoint = topHairline.points[0]
            for(let i = 0; i < topSegmentCount; i++){
                let curPoint = topHairline.points[Math.floor(segments[i]*totalTopPoints-0.01)]
                if(i == 0){ // special case for start and end
                    let curvePoint = this.trianglePoint(prevPoint, curPoint, util.prop(-0.2,0,ref.bangEdgeCurves[0]))
                    bangLine.addPath(this.generate3PointBezier(prevPoint, curvePoint, curPoint))
                }else if(i == topSegmentCount-1){
                    let curvePoint = this.trianglePoint(prevPoint, curPoint, util.prop(-0.2,0,ref.bangEdgeCurves[1]))
                    bangLine.addPath(this.generate3PointBezier(prevPoint, curvePoint, curPoint))
                }else{
                    let hairType = Math.floor(util.prop(0, 3, ref.hairType[i]))
                    if(hairType == 0 && segments[i]-segments[i-1] > 0.4){ //flat bang
                        let midPointRatio1 = segments[i-1]+(segments[i]-segments[i-1])*util.prop(0.03,0.07,ref.bangSegmentRand[i][0])
                        let midPointRatio2 = segments[i-1]+(segments[i]-segments[i-1])*util.prop(0.93,0.97,ref.bangSegmentRand[i][1])
                        let midPoint1 = bottomHairline.points[Math.floor(midPointRatio1*totalBottomPoints-0.01)]
                        let midPoint2 = bottomHairline.points[Math.floor(midPointRatio2*totalBottomPoints-0.01)]
                        
                        bangLine.addPath(this.generateLineP(prevPoint, midPoint1))
                        bangLine.addPath(this.generateLineP(midPoint1, midPoint2))
                        bangLine.addPath(this.generateLineP(midPoint2, curPoint))
                    }else if(hairType == 1 || hairType == 2){ //left anchor left curl/right anchor right curl
                        let curveDir = 1
                        let anchorVar = util.prop(-0.05,0.1,ref.bangSegmentRand[i][0])
                        let anchor = [1-anchorVar,0+anchorVar]
                        if(hairType == 2){
                            curveDir = -1
                            anchor = [0+anchorVar,1-anchorVar]
                        }
                        let anchorRatio = Math.max(0, Math.min(0.99999, segments[i-1]*anchor[0] + segments[i]*anchor[1]))
                        let midPoint = bottomHairline.points[Math.floor((anchorRatio)*totalBottomPoints-0.01)]
                        let curvePoint = this.trianglePoint(prevPoint, midPoint, util.prop(0,-0.2,ref.bangSegmentRand[i][2])*curveDir)
                        bangLine.addPath(this.generate3PointBezier(prevPoint, curvePoint, midPoint))
                        curvePoint = this.trianglePoint(midPoint, curPoint, util.prop(0,0.2,ref.bangSegmentRand[i][3])*curveDir)
                        bangLine.addPath(this.generate3PointBezier(midPoint, curvePoint, curPoint))
                    }else{ //middle anchor puff
                        let midPoint = bottomHairline.points[Math.floor((segments[i]+segments[i-1])/2*totalBottomPoints-0.01)]
                        let curvePoint = this.trianglePoint(prevPoint, midPoint, util.prop(0,0.2,ref.bangSegmentRand[i][0]))
                        bangLine.addPath(this.generate3PointBezier(prevPoint, curvePoint, midPoint))
                        curvePoint = this.trianglePoint(midPoint, curPoint, util.prop(0,0.2,ref.bangSegmentRand[i][1]))
                        bangLine.addPath(this.generate3PointBezier(midPoint, curvePoint, curPoint))
                    }
                }
                prevPoint = curPoint
            }
        }
        
        return bangLine
    }

    // generate face paths: returns a list of paths for the face of a chibi with the specified expressions and Ref
    generateFacePaths(ref){
        let facePaths = []
        let RNG1 = util.propC(1.2,0.8,ref.accRand1)
        let RNG2 = util.propC(1.2,0.8,ref.accRand2)
        let RNG3 = util.propC(1.2,0.8,ref.accRand3)
        let RNG4 = util.propC(1.2,0.8,ref.accRand4)
        let eyeStyle = ref.eyeStyle
        let mouthStyle = ref.mouthStyle
        let accessories = ref.accessories

        //Accessories generation (Under the face)
        //Expressions stuff accessory (Begins from 100)
        let expressionAcc= -1
        for (let i=0; i<accessories.length; i++){
            if (accessories[i]-100 >=0 && accessories[i]-100 <=99){
                expressionAcc = accessories[i]-100
                break
            }
        }
        switch(expressionAcc){ //I: (I used a weird format for case here to avoid scope issues + my IDE was being weird)
            case -1: //No 
            default:{
                break
            }case 0:{ //blush oval
                let expressionWidth = ref.width/7.5*RNG3
                let expressionHeight = ref.height/14.5*RNG4
                facePaths.push(this.generateOval(ref.leftEye[0]+expressionWidth/2,ref.leftEye[1]+expressionHeight/0.27,expressionWidth,expressionHeight,0.2,"#00000000","#FFCCCC55"))
                facePaths.push(this.generateOval(ref.rightEye[0]-expressionWidth/2,ref.rightEye[1]+expressionHeight/0.27,expressionWidth,expressionHeight,0.2,"#00000000","#FFCCCC55"))
                break
            }case 1:{ //Im gonna kill you
                let expressionWidth = ref.width
                let expressionHeight = ref.height/1.77
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/15,expressionWidth,expressionHeight,0,360,0.22,"#00000000","#222222BB"))
                break
            }case 2:{//eyebags
                let expressionWidth = ref.width/7.5*RNG3
                let expressionHeight = ref.height/14.5*RNG4
                facePaths.push(this.generateOval(ref.leftEye[0],ref.leftEye[1]+expressionHeight/0.47,expressionWidth,expressionHeight,0.2,"#00000000","#222222BB"))
                facePaths.push(this.generateOval(ref.rightEye[0],ref.rightEye[1]+expressionHeight/0.47,expressionWidth,expressionHeight,0.2,"#00000000","#222222BB"))
                break
            }
        }

        //Facepaint/signature accessory (Begins from 200)
        let facepaint= -1
        for (let i=0; i<accessories.length; i++){
            if (accessories[i]-200 >=0 && accessories[i]-200 <=99){
                facepaint = accessories[i]-200
                break
            }  
        }
        switch(facepaint){ //(I used a weird format for case here to avoid scope issues + my IDE was being weird)
            case -1: //No 
            default:{
                break
            }case 0:{//Rambo war paint
                let expressionWidth = ref.width/7.5*RNG3
                let expressionHeight = ref.height/22.5*RNG4
                facePaths.push(this.generateOval(ref.leftEye[0],ref.leftEye[1]+expressionHeight/0.15,expressionWidth,expressionHeight,0.2,"#00000000","#222222BB"))
                facePaths.push(this.generateOval(ref.rightEye[0],ref.rightEye[1]+expressionHeight/0.15,expressionWidth,expressionHeight,0.2,"#00000000","#222222BB"))
                facePaths.push(this.generateOval(ref.leftEye[0],ref.leftEye[1]+expressionHeight/0.1,expressionWidth,expressionHeight,0.2,"#00000000","#222222BB"))
                facePaths.push(this.generateOval(ref.rightEye[0],ref.rightEye[1]+expressionHeight/0.1,expressionWidth,expressionHeight,0.2,"#00000000","#222222BB"))
                break
            }case 1:{//Eye Scar left
                let expressionWidth = ref.width/57.5*RNG3
                let expressionHeight = ref.height/4.5*RNG4
                facePaths.push(this.generateOvalP(ref.leftEye,expressionWidth,expressionHeight,-0.02,"#660000","none"))
                break
            }case 2:{//Eye Scar right
                let expressionWidth = ref.width/57.5*RNG3
                let expressionHeight = ref.height/4.5*RNG4
                facePaths.push(this.generateOvalP(ref.rightEye,expressionWidth,expressionHeight,-0.02,"#660000","none"))
                break
            }
        }
        
        //eyebrows (Begins from 300)
        let browStyle= -1
        for (let i=0; i<accessories.length; i++){
            if (accessories[i]-300 >=0 && accessories[i]-300 <=99){
                browStyle = accessories[i]-300
                break
            }
        }
        switch(browStyle){ //(I used a weird format for case here to avoid scope issues + my IDE was being weird)
            case -1: //No eyebrow
            default:{
                break
            }
            case 0:{ //Sadd
                let lineLen = ref.width/3.5*RNG3
                let expressionLevel = ref.height/9.5
                facePaths.push(this.generateLine(ref.rightBrow[0]+lineLen/2,ref.rightBrow[1],ref.rightBrow[0]-lineLen/2,ref.rightBrow[1]+expressionLevel))
                facePaths.push(this.generateLine(ref.leftBrow[0]+lineLen/2,ref.leftBrow[1]+expressionLevel,ref.leftBrow[0]-lineLen/2,ref.leftBrow[1]))
                break
            }case 1:{ //Angy
                let lineLen = ref.width/3.5*RNG3
                let expressionLevel = ref.height/9.5
                facePaths.push(this.generateLine(ref.rightBrow[0]+lineLen/2,ref.rightBrow[1]+expressionLevel,ref.rightBrow[0]-lineLen/2,ref.rightBrow[1]))
                facePaths.push(this.generateLine(ref.leftBrow[0]+lineLen/2,ref.leftBrow[1],ref.leftBrow[0]-lineLen/2,ref.leftBrow[1]+expressionLevel))
                break
            }case 2:{ //Seriously?
                let lineLen = ref.width/3.5*RNG3
                let expressionLevel = ref.height/20
                facePaths.push(this.generateLine(ref.rightBrow[0]+lineLen/2,ref.rightBrow[1]+expressionLevel,ref.rightBrow[0]-lineLen/2,ref.rightBrow[1]+expressionLevel))
                facePaths.push(this.generateLine(ref.leftBrow[0]+lineLen/2,ref.leftBrow[1]+expressionLevel,ref.leftBrow[0]-lineLen/2,ref.leftBrow[1]+expressionLevel))
                break
            }case 3:{ //Suprised
                let lineLen = ref.width/3.5*RNG3
                let expressionLevel = -(ref.height/20)
                facePaths.push(this.generateLine(ref.rightBrow[0]+lineLen/2,ref.rightBrow[1]+expressionLevel,ref.rightBrow[0]-lineLen/2,ref.rightBrow[1]+expressionLevel))
                facePaths.push(this.generateLine(ref.leftBrow[0]+lineLen/2,ref.leftBrow[1]+expressionLevel,ref.leftBrow[0]-lineLen/2,ref.leftBrow[1]+expressionLevel))
                break
            }case 4:{ //Sass 
                let lineLen = ref.width/3.5*RNG3
                let expressionLevel = -(ref.height/10)
                facePaths.push(this.generate4PointBezier([ref.rightBrow[0]+lineLen/2,ref.rightBrow[1]],[ref.rightBrow[0],ref.rightBrow[1]+expressionLevel] ,[ref.rightBrow[0],ref.rightBrow[1]+expressionLevel] , [ref.rightBrow[0]-lineLen/2,ref.rightBrow[1]+expressionLevel]))
                facePaths.push(this.generate4PointBezier([ref.leftBrow[0]+lineLen/2,ref.leftBrow[1]],[ref.leftBrow[0],ref.leftBrow[1]+expressionLevel/2] ,[ref.leftBrow[0],ref.leftBrow[1]+expressionLevel/2] , [ref.leftBrow[0]-lineLen/2,ref.leftBrow[1]]))
                break
            }case 5:{ //Filrt
                let lineLen = ref.width/3.5*RNG3
                let expressionLevel = -(ref.height/10)
                facePaths.push(this.generate4PointBezier([ref.leftBrow[0]+lineLen/2,ref.leftBrow[1]],[ref.leftBrow[0],ref.leftBrow[1]+expressionLevel] ,[ref.leftBrow[0],ref.leftBrow[1]+expressionLevel] , [ref.leftBrow[0]-lineLen/2,ref.leftBrow[1]+expressionLevel]))
                facePaths.push(this.generate4PointBezier([ref.rightBrow[0]+lineLen/2,ref.rightBrow[1]],[ref.rightBrow[0],ref.rightBrow[1]+expressionLevel/2] ,[ref.rightBrow[0],ref.rightBrow[1]+expressionLevel/2] , [ref.rightBrow[0]-lineLen/2,ref.rightBrow[1]]))
                break
            }case 6:{ //Real Suprised
                let lineLen = ref.width/3.5*RNG3
                let expressionLevel = -(ref.height/10)
                facePaths.push(this.generate4PointBezier([ref.leftBrow[0]+lineLen/2,ref.leftBrow[1]+expressionLevel/2],[ref.leftBrow[0],ref.leftBrow[1]+expressionLevel] ,[ref.leftBrow[0],ref.leftBrow[1]+expressionLevel] , [ref.leftBrow[0]-lineLen/2,ref.leftBrow[1]+expressionLevel/2]))
                facePaths.push(this.generate4PointBezier([ref.rightBrow[0]+lineLen/2,ref.rightBrow[1]+expressionLevel/2],[ref.rightBrow[0],ref.rightBrow[1]+expressionLevel] ,[ref.rightBrow[0],ref.rightBrow[1]+expressionLevel] , [ref.rightBrow[0]-lineLen/2,ref.rightBrow[1]+expressionLevel/2]))
                break
            }
        }


        RNG1 = util.propC(1.2,0.8,ref.eyeRand1)
        RNG2 = util.propC(1.2,0.8,ref.eyeRand2)
        RNG3 = util.propC(1.2,0.8,ref.eyeRand3)
        RNG4 = util.propC(1.2,0.8,ref.eyeRand4)

        //The eye glossary!
        switch(eyeStyle){ //(I used a weird format for case here to avoid scope issues + my IDE was being weird)
            case 0:{ //Hollow Beanz
                facePaths.push(this.generateCircleP(ref.leftEye, ref.width/24))
                facePaths.push(this.generateCircleP(ref.rightEye, ref.width/24))
                break
            }case 1:{ //Smol Beanz
                facePaths.push(this.generateCircleP(ref.leftEye, 0))
                facePaths.push(this.generateCircleP(ref.rightEye, 0))
                break
            }case 2:{ //Beeg Beanz
                facePaths.push(this.generateOvalP(ref.leftEye, ref.height/12*1.3*util.propC(1.2,0.8,ref.eyeRand1), ref.height/6,0,"#222222", "#ffffff"))
                facePaths.push(this.generateOvalP(ref.rightEye, ref.height/12*1.3*util.propC(1.2,0.8,ref.eyeRand1), ref.height/6,0,"#222222", "#ffffff"))
                break
            }case 3:{ //smol Horzantal
                let lineLen = ref.width/4.6*RNG1
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1],ref.leftEye[0]-lineLen/2,ref.leftEye[1]))
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1],ref.rightEye[0]-lineLen/2,ref.rightEye[1]))
                break
            }case 4:{ //beeg horizantal
                let lineLen = ref.width/2.8*RNG1
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1],ref.leftEye[0]-lineLen/2,ref.leftEye[1]))
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1],ref.rightEye[0]-lineLen/2,ref.rightEye[1]))
                break
            }case 5:{ //smol vert
                let lineLen = ref.height/4.6*RNG1
                facePaths.push(this.generateLine(ref.leftEye[0],ref.leftEye[1]+lineLen/2,ref.leftEye[0],ref.leftEye[1]-lineLen/2))
                facePaths.push(this.generateLine(ref.rightEye[0],ref.rightEye[1]+lineLen/2,ref.rightEye[0],ref.rightEye[1]-lineLen/2))
                break
            }case 6:{ //beeg vert
                let lineLen = ref.height/3*RNG1
                facePaths.push(this.generateLine(ref.leftEye[0],ref.leftEye[1]+lineLen/2,ref.leftEye[0],ref.leftEye[1]-lineLen/2))
                facePaths.push(this.generateLine(ref.rightEye[0],ref.rightEye[1]+lineLen/2,ref.rightEye[0],ref.rightEye[1]-lineLen/2))
                break
            }case 7:{ //unimpressed double line
                let lineLen = ref.width/3.5*RNG1
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1]+12,ref.leftEye[0]-lineLen/2,ref.leftEye[1]+12))
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1]+12,ref.rightEye[0]-lineLen/2,ref.rightEye[1]+12))
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1]-12,ref.leftEye[0]-lineLen/2,ref.leftEye[1]-12))
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1]-12,ref.rightEye[0]-lineLen/2,ref.rightEye[1]-12))
                break
            }case 8:
            default:{ //YAiY
                let lineLen = ref.width/3.5*RNG1
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1],ref.rightEye[0]-lineLen/2,ref.rightEye[1]+22))
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1]+22,ref.leftEye[0]-lineLen/2,ref.leftEye[1]))
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1],ref.rightEye[0]-lineLen/2,ref.rightEye[1]-22))
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1]-22,ref.leftEye[0]-lineLen/2,ref.leftEye[1]))
                break
            }case 9:{ //unimpressed stare
                let lineLen = ref.width/3*RNG1
                let eyeVert = ref.height/4.1*RNG2
                facePaths.push(this.generatePartialOval(ref.leftEye[0],ref.leftEye[1],lineLen/2.5,eyeVert/1.5,0,180,0.2,"#000000", "#666666"))
                facePaths.push(this.generatePartialOval(ref.rightEye[0],ref.rightEye[1],lineLen/2.5,eyeVert/1.5,0,180,0.2,"#000000", "#666666"))
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1]+0,ref.leftEye[0]-lineLen/2,ref.leftEye[1]+0))
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1]+0,ref.rightEye[0]-lineLen/2,ref.rightEye[1]+0))
                break
            }case 10:{ //holding in a laugh
                let lineLen = ref.width/3.5*RNG1
                let eyeVert = ref.height/4.1*RNG2
                facePaths.push(this.generatePartialOval(ref.leftEye[0],ref.leftEye[1]+12,lineLen/2,eyeVert/1.1,180,360,0.2,"#000000", "#FFFFFF"))
                facePaths.push(this.generatePartialOval(ref.rightEye[0],ref.rightEye[1]+12,lineLen/2,eyeVert/1.1,180,360,0.2,"#000000", "#FFFFFF"))
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1]+12,ref.leftEye[0]-lineLen/2,ref.leftEye[1]+12))
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1]+12,ref.rightEye[0]-lineLen/2,ref.rightEye[1]+12))
                break
            }

            case 100:{ //Plus sign
                let lineLen = ref.width/2.8*RNG1
                facePaths.push(this.generateOval(ref.leftEye[0],ref.leftEye[1],ref.height/12*1.3*util.propC(1.2,0.8,ref.eyeRand1), ref.height/6,-1,"#222222", "#222222"))
                facePaths.push(this.generateOval(ref.rightEye[0],ref.rightEye[1],ref.height/12*1.3*util.propC(1.2,0.8,ref.eyeRand1), ref.height/6,-1,"#222222", "#222222"))
                break
            }case 101:{ //Star
                let lineLen = ref.width*RNG1
                facePaths.push(this.generateOval(ref.leftEye[0],ref.leftEye[1],ref.height/8*1.3*util.propC(1.2,0.8,ref.eyeRand1), ref.height/4,-0.5,"#222222", "#EEEE44"))
                facePaths.push(this.generateOval(ref.rightEye[0],ref.rightEye[1],ref.height/8*1.3*util.propC(1.2,0.8,ref.eyeRand1), ref.height/4,-0.5,"#222222", "#EEEE44"))
                break
            }case 102:{ //Advert vision left
                let lineLen = ref.width/3*RNG1
                let eyeVert = ref.height/4.3*RNG2
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1],ref.leftEye[0]-lineLen/2,ref.leftEye[1]))
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1],ref.rightEye[0]-lineLen/2,ref.rightEye[1]))
                facePaths.push(this.generatePartialOval(ref.leftEye[0]+lineLen/3,ref.leftEye[1],lineLen/4,eyeVert/2,0,180,0.2,"#000000", "#666666"))
                facePaths.push(this.generatePartialOval(ref.rightEye[0]+lineLen/3,ref.rightEye[1],lineLen/4,eyeVert/2,0,180,0.2,"#000000", "#666666"))
                break
            }case 103:{ //Advert vision right
                let lineLen = ref.width/3*RNG1
                let eyeVert = ref.height/4.3*RNG2
                facePaths.push(this.generateLine(ref.leftEye[0]+lineLen/2,ref.leftEye[1],ref.leftEye[0]-lineLen/2,ref.leftEye[1]))
                facePaths.push(this.generateLine(ref.rightEye[0]+lineLen/2,ref.rightEye[1],ref.rightEye[0]-lineLen/2,ref.rightEye[1]))
                facePaths.push(this.generatePartialOval(ref.leftEye[0]-lineLen/3,ref.leftEye[1],lineLen/4,eyeVert/2,0,180,0.2,"#000000", "#666666"))
                facePaths.push(this.generatePartialOval(ref.rightEye[0]-lineLen/3,ref.rightEye[1],lineLen/4,eyeVert/2,0,180,0.2,"#000000", "#666666"))
                break
            }case 104:{ //Angy Boll
                let lineLen = ref.width/3.8*RNG1
                let eyeVert = ref.height/4.3*RNG2
                let leftAngy = this.generatePartialOval(ref.leftEye[0],ref.leftEye[1],lineLen/2,eyeVert/1.1,-60,150,0.2,"#000000", "#BB5555")
                leftAngy.addPath(this.generateLine(ref.leftEye[0]-lineLen/2,ref.leftEye[1]+0.2*eyeVert,ref.leftEye[0],ref.leftEye[1]-0.8*eyeVert))
                leftAngy.addPoint(leftAngy.points[0])

                let rightAngy = this.generatePartialOval(ref.rightEye[0],ref.rightEye[1],lineLen/2,eyeVert/1.1,30,240,0.2,"#000000", "#BB5555")
                rightAngy.addPath(this.generateLine(ref.rightEye[0],ref.rightEye[1]-0.8*eyeVert,ref.rightEye[0]+lineLen/2,ref.rightEye[1]+0.2*eyeVert)) //reverse order to fit mirrored side
                rightAngy.addPoint(rightAngy.points[0])
                
                facePaths.push(leftAngy)
                facePaths.push(rightAngy)
                break
            }case 105:{ //hearts
                let lineLen = ref.width/3*RNG1
                let eyeVert = ref.height/4.3*RNG2

                let leftEyePath = this.generatePartialOval(ref.leftEye[0]-lineLen/3.5,ref.leftEye[1]+eyeVert/2.5,lineLen/4,eyeVert/2,180,330,0.2,"#000000", "#EEBBBB")
                leftEyePath.addPath(this.generatePartialOval(ref.leftEye[0]+lineLen/3.5,ref.leftEye[1]+eyeVert/2.5,lineLen/4,eyeVert/2,210,360,0.2,"#000000"))
                leftEyePath.addPath(this.generatePartialOval(ref.leftEye[0],ref.leftEye[1]+eyeVert/3.5,lineLen/1.7,eyeVert/0.9,10,170,-0.2,"#000000"))
                leftEyePath.addPoint(leftEyePath.points[0])
                facePaths.push(leftEyePath)

                let rightEyePath = this.generatePartialOval(ref.rightEye[0]-lineLen/3.5,ref.rightEye[1]+eyeVert/2.5,lineLen/4,eyeVert/2,180,330,0.2,"#000000", "#EEBBBB")
                rightEyePath.addPath(this.generatePartialOval(ref.rightEye[0]+lineLen/3.5,ref.rightEye[1]+eyeVert/2.5,lineLen/4,eyeVert/2,210,360,0.2,"#000000", "#EEBBBB"))
                rightEyePath.addPath(this.generatePartialOval(ref.rightEye[0],ref.rightEye[1]+eyeVert/3.5,lineLen/1.7,eyeVert/0.9,10,170,-0.2,"#000000", "#EEBBBB"))
                rightEyePath.addPoint(rightEyePath.points[0])
                facePaths.push(rightEyePath)

                break
            }case 106:{ //Bouta Cry
                facePaths.push(this.generateOvalWonky(ref.leftEye[0],ref.leftEye[1], ref.height/4, ref.height/4,-0.44,"#222222", "#BBCCFF"))
                facePaths.push(this.generateOvalWonky(ref.rightEye[0],ref.rightEye[1], ref.height/4, ref.height/4,-0.44,"#222222", "#BBCCFF"))
                break
            }
        }

        RNG1 = util.propC(1.2,0.8,ref.mouthRand1)
        RNG2 = util.propC(1.2,0.8,ref.mouthRand2)
        RNG3 = util.propC(1.2,0.8,ref.mouthRand3)
        RNG4 = util.propC(1.2,0.8,ref.mouthRand4)
    
        //The mouth glossary!
        switch(mouthStyle){
            case 0:{ //Emotionless
                let mouthWidth = ref.width/3.4*RNG1
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1],ref.mouth[0]+mouthWidth/2,ref.mouth[1]))
                break
            }case 1:{ //Angy
                let mouthWidth = ref.width/4.4*RNG1
                let angynessLevel = ref.height/7*RNG2
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]+angynessLevel/2,ref.mouth[0],ref.mouth[1]-angynessLevel/2))
                facePaths.push(this.generateLine(ref.mouth[0]+mouthWidth/2,ref.mouth[1]+angynessLevel/2,ref.mouth[0],ref.mouth[1]-angynessLevel/2))
                break
            }case 2:{ //Angy opn
                let mouthWidth = ref.width/2.5*RNG1
                let angynessLevel = ref.height/4*RNG2

                let mouthLines = this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]+angynessLevel/2,ref.mouth[0],ref.mouth[1]-angynessLevel/2)
                mouthLines.addPath(this.generateLine(ref.mouth[0]+mouthWidth/2,ref.mouth[1]+angynessLevel/2,ref.mouth[0],ref.mouth[1]-angynessLevel/2))
                mouthLines.addPath(this.generateLine(ref.mouth[0]+mouthWidth/2,ref.mouth[1]+angynessLevel/2,ref.mouth[0]-mouthWidth/2,ref.mouth[1]+angynessLevel/2))
                mouthLines.addPoint(mouthLines.points[0])
                mouthLines.makeCircular()
                mouthLines.setFillStyle("#EEBBBB")
                facePaths.push(mouthLines)
                break
            }case 3:{ //Smle
                let mouthWidth = ref.width/4.4*RNG1
                let angynessLevel = ref.height/7*RNG2
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0],ref.mouth[1]+angynessLevel/2))
                facePaths.push(this.generateLine(ref.mouth[0]+mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0],ref.mouth[1]+angynessLevel/2))
                break
            }case 4:{ //Smle opn
                let mouthWidth = ref.width/2.5*RNG1
                let angynessLevel = ref.height/4*RNG2

                let mouthLines = this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0],ref.mouth[1]+angynessLevel/2)
                mouthLines.addPath(this.generateLine(ref.mouth[0],ref.mouth[1]+angynessLevel/2,ref.mouth[0]+mouthWidth/2,ref.mouth[1]-angynessLevel/2))
                mouthLines.addPath(this.generateLine(ref.mouth[0]+mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0]-mouthWidth/2,ref.mouth[1]-angynessLevel/2))
                mouthLines.addPoint(mouthLines.points[0])
                mouthLines.makeCircular()
                mouthLines.setFillStyle("#EEBBBB")
                facePaths.push(mouthLines)
                break
            }case 5: //AAAAAAAaaaAAAAAAAaaaaaaAAAAA
            default:{
                let mouthWidth = ref.height/10*RNG1
                let mouthHeight = ref.height/5*RNG2
                facePaths.push(this.generateOval(ref.mouth[0],ref.mouth[1],mouthWidth,mouthHeight,0.00,"#000000","#EEBBBB"))
                break
            }case 6:{ //Smle round
                let mouthWidth = ref.width/2.5*RNG1
                let angynessLevel = ref.height/2.8*RNG2
                facePaths.push(this.generatePartialOval(ref.mouth[0],ref.mouth[1]-angynessLevel/2,mouthWidth/2,angynessLevel,0,180,0,"#000000","#EEBBBB"))
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0]+mouthWidth/2,ref.mouth[1]-angynessLevel/2))
                break
            }case 7:{ //Sad round
                let mouthWidth = ref.width/2.5*RNG1
                let angynessLevel = ref.height/2.5*RNG2
                facePaths.push(this.generatePartialOval(ref.mouth[0],ref.mouth[1]+angynessLevel/2,mouthWidth/2,angynessLevel,180,360,0,"#000000","#EEBBBB"))
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]+angynessLevel/2,ref.mouth[0]+mouthWidth/2,ref.mouth[1]+angynessLevel/2))
                break
            }case 8:{ //Very Emotionless
                let mouthWidth = ref.width/99*RNG1
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1],ref.mouth[0]+mouthWidth/2,ref.mouth[1]))
                break
            }case 9:{ //Mildly happy
                let mouthWidth = ref.width/3.4*RNG1
                let emotionLevel = ref.height/7.7*RNG2
                facePaths.push(this.generate4PointBezier([ref.mouth[0]-mouthWidth/2,ref.mouth[1]],[ref.mouth[0]-mouthWidth/4,ref.mouth[1]+emotionLevel],[ref.mouth[0]+mouthWidth/4,ref.mouth[1]+emotionLevel],[ref.mouth[0]+mouthWidth/2,ref.mouth[1]]))
                break
            }case 10:{ //Mildly unhappy
                let mouthWidth = ref.width/3.4*RNG1
                let emotionLevel = ref.height/9.7*RNG2
                facePaths.push(this.generate4PointBezier([ref.mouth[0]-mouthWidth/2,ref.mouth[1]],[ref.mouth[0]-mouthWidth/5,ref.mouth[1]-emotionLevel],[ref.mouth[0]+mouthWidth/5,ref.mouth[1]-emotionLevel],[ref.mouth[0]+mouthWidth/2,ref.mouth[1]]))
                break
            }case 11:{ //ツ
                let mouthWidth = ref.width/3.4*RNG1
                let emotionLevel = ref.height/7.7*RNG2
                facePaths.push(this.generate4PointBezier([ref.mouth[0]-mouthWidth/2,ref.mouth[1]],[ref.mouth[0]-mouthWidth/4,ref.mouth[1]+emotionLevel/2],[ref.mouth[0]+mouthWidth/4,ref.mouth[1]+emotionLevel/2],[ref.mouth[0]+mouthWidth/2,ref.mouth[1]-emotionLevel/2]))
                break
            }case 12:{ //~
                let mouthWidth = ref.width/3.4*RNG1
                let emotionLevel = ref.height/9.7*RNG2
                facePaths.push(this.generate4PointBezier([ref.mouth[0]-mouthWidth/2,ref.mouth[1]],[ref.mouth[0]-mouthWidth/5,ref.mouth[1]+emotionLevel],[ref.mouth[0]+mouthWidth/5,ref.mouth[1]-emotionLevel],[ref.mouth[0]+mouthWidth/2,ref.mouth[1]]))
                break
            }case 13:{ //micro Smle
                let mouthWidth = ref.width/4.5*RNG1
                let angynessLevel = ref.height/5.1*RNG2
                facePaths.push(this.generatePartialOval(ref.mouth[0],ref.mouth[1]-angynessLevel/2,mouthWidth/2,angynessLevel,0,180,0,"#000000","#EEBBBB"))
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0]+mouthWidth/2,ref.mouth[1]-angynessLevel/2))
                break
            }case 14:{ //micro Sad 
                let mouthWidth = ref.width/4.5*RNG1
                let angynessLevel = ref.height/4.5*RNG2
                facePaths.push(this.generatePartialOval(ref.mouth[0],ref.mouth[1]+angynessLevel/2,mouthWidth/2,angynessLevel,180,360,0,"#000000","#EEBBBB"))
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]+angynessLevel/2,ref.mouth[0]+mouthWidth/2,ref.mouth[1]+angynessLevel/2))
                break
            }


            case 100:{ //Blep Left
                let mouthWidth = ref.width/2.5*RNG1
                let angynessLevel = ref.height/5.8*RNG2
                facePaths.push(this.generatePartialOval(ref.mouth[0]-mouthWidth/4,ref.mouth[1]-angynessLevel/2,mouthWidth/4,angynessLevel,0,180,0,"#000000","#EEBBBB"))
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0]+mouthWidth/2,ref.mouth[1]-angynessLevel/2))
                break
            }case 101:{ //Blep Reft
                let mouthWidth = ref.width/2.5*RNG1
                let angynessLevel = ref.height/5.8*RNG2
                facePaths.push(this.generatePartialOval(ref.mouth[0]+mouthWidth/4,ref.mouth[1]-angynessLevel/2,mouthWidth/4,angynessLevel,0,180,0,"#000000","#EEBBBB"))
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0]+mouthWidth/2,ref.mouth[1]-angynessLevel/2))
                break
            }case 102:{ //Cross
                let mouthWidth = ref.width/4.5*RNG1
                let angynessLevel = ref.height/4.5*RNG2
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0]+mouthWidth/2,ref.mouth[1]+angynessLevel/2))
                facePaths.push(this.generateLine(ref.mouth[0]+mouthWidth/2,ref.mouth[1]-angynessLevel/2,ref.mouth[0]-mouthWidth/2,ref.mouth[1]+angynessLevel/2))
                break
            }case 103:{ //Granny Face
                let mouthWidth = ref.width/2.5*RNG1
                let angynessLevel = ref.height/7*RNG2
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2,ref.mouth[1],ref.mouth[0]+mouthWidth/2,ref.mouth[1]))
                facePaths.push(this.generateLine(ref.mouth[0]-mouthWidth/2-angynessLevel/4,ref.mouth[1]+angynessLevel/2,ref.mouth[0]-mouthWidth/2+angynessLevel/4,ref.mouth[1]-angynessLevel/2))
                facePaths.push(this.generateLine(ref.mouth[0]+mouthWidth/2+angynessLevel/4,ref.mouth[1]+angynessLevel/2,ref.mouth[0]+mouthWidth/2-angynessLevel/4,ref.mouth[1]-angynessLevel/2))
                break
            }case 104:{ //Derpy McDroll
                let mouthWidth = ref.width/4*RNG1
                let mouthHeight = ref.height/4*RNG2
                facePaths.push(this.generateOval(ref.mouth[0],ref.mouth[1],mouthWidth,mouthHeight,0.00,"#00000000","#EEBBBB"))
                facePaths.push(this.generatePartialOval(ref.mouth[0],ref.mouth[1],mouthWidth,mouthHeight,80,400,0.00,"#000000","#EEBBBB"))
                facePaths.push(this.generatePartialOval(ref.mouth[0]+mouthWidth/2,ref.mouth[1]+mouthHeight*Math.sqrt(3)/2,mouthWidth/3,mouthHeight/3,-30,150,0.00,"#000000","#EEBBBB"))
                break
            }case 105:{ //munch
                let mouthWidth = ref.width/3.4*RNG1
                let emotionLevel = ref.height/9.7*RNG2
                facePaths.push(this.generate4PointBezier([ref.mouth[0]-mouthWidth/2,ref.mouth[1]],[ref.mouth[0]-mouthWidth/5,ref.mouth[1]+emotionLevel],[ref.mouth[0]+mouthWidth/5,ref.mouth[1]-emotionLevel],[ref.mouth[0]+mouthWidth/2,ref.mouth[1]]))
                if (ref.angleX<=0)
                    facePaths.push(this.generate4PointBezier([ref.mouth[0]+mouthWidth/1.6,ref.mouth[1]-emotionLevel],
                                                             [ref.mouth[0]+mouthWidth/2,ref.mouth[1]],
                                                             [ref.mouth[0]+mouthWidth/2,ref.mouth[1]],
                                                             [ref.mouth[0]+mouthWidth/1.6,ref.mouth[1]+emotionLevel]))
                else
                    facePaths.push(this.generate4PointBezier([ref.mouth[0]+mouthWidth/1.6,ref.mouth[1]-emotionLevel],
                                                             [ref.mouth[0]+mouthWidth/2,ref.mouth[1]],
                                                             [ref.mouth[0]+mouthWidth/2,ref.mouth[1]],
                                                             [ref.mouth[0]+mouthWidth/1.6,ref.mouth[1]+emotionLevel]))
                break
            }
        }

        RNG1 = util.propC(1.2,0.8,ref.accRand1)
        RNG2 = util.propC(1.2,0.8,ref.accRand2)
        RNG3 = util.propC(1.2,0.8,ref.accRand3)
        RNG4 = util.propC(1.2,0.8,ref.accRand4)

        //hats (starts from 400)
        let hats=-1
        for (let i=0; i<accessories.length; i++){
            if (accessories[i]-400 >=0 && accessories[i]-400 <=99){
                hats = accessories[i]-400
                break
            }  
        }
        switch(hats){ //(I used a weird format for case here to avoid scope issues + my IDE was being weird)
            case -1: //No 
            default:{
                break
            }case 0:{//tophat
                let hatHeight = ref.height/1.1*RNG2
                let brimWidth = ref.width/1.2*RNG3
                let brimHeight = ref.width/3.8*RNG4

                // facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height-hatHeight/2,brimWidth/2,hatHeight/2,-0,360,0.4,"#00000000","#444444"))
                
                // base color
                let baseRectangle = this.generateLine(ref.centerX-brimWidth/2,ref.centerY-ref.height-brimHeight/2.5,ref.centerX-brimWidth/2,ref.centerY-ref.height-hatHeight, "#000000")
                baseRectangle.addPath(this.generateLine(ref.centerX+brimWidth/2,ref.centerY-ref.height-hatHeight,ref.centerX+brimWidth/2,ref.centerY-ref.height-brimHeight/2.5))
                baseRectangle.setFillStyle("#444444")
                facePaths.push(baseRectangle)

                //top circle
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height-hatHeight,brimWidth/2,brimHeight/2,-0,360,0,"#000000","#444444"))
                //bottom outer rim
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height,brimWidth,brimHeight,-60,240,0,"#000000","#444444"))
                //bottom inner rim
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height-brimHeight/2.5,brimWidth/2,brimHeight/2,-0,180,0,"#000000","#444444"))
                //sides
                facePaths.push(this.generateLine(ref.centerX-brimWidth/2,ref.centerY-ref.height-brimHeight/2.5,ref.centerX-brimWidth/2,ref.centerY-ref.height-hatHeight))
                facePaths.push(this.generateLine(ref.centerX+brimWidth/2,ref.centerY-ref.height-brimHeight/2.5,ref.centerX+brimWidth/2,ref.centerY-ref.height-hatHeight))
                break
            }case 1:{//TALL tophat
                let hatHeight = ref.height/0.3*RNG2
                let brimWidth = ref.width/1.2*RNG3
                let brimHeight = ref.width/3.8*RNG4
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height-hatHeight/2,brimWidth/2,hatHeight/2,-0,360,0.4,"#00000000","#444444"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height,brimWidth,brimHeight,-60,240,0,"#000000","#444444"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height-brimHeight/2.5,brimWidth/2,brimHeight/2,-0,180,0,"#000000","#444444"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height-hatHeight,brimWidth/2,brimHeight/2,-0,360,0,"#000000","#444444"))
                facePaths.push(this.generateLine(ref.centerX-brimWidth/2,ref.centerY-ref.height-brimHeight/2.5,ref.centerX-brimWidth/2,ref.centerY-ref.height-hatHeight))
                facePaths.push(this.generateLine(ref.centerX+brimWidth/2,ref.centerY-ref.height-brimHeight/2.5,ref.centerX+brimWidth/2,ref.centerY-ref.height-hatHeight))
                break
            }case 2:{//Straw hat
                let brimWidth = ref.width/0.7*RNG3
                let brimHeight = ref.width/2.7*RNG4
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/1.5,brimWidth,brimHeight,-70,250,0,"#000000","#d1be88"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/1.3-brimHeight/2.5,brimWidth/2.4,brimHeight*1.2,180,360,0,"#000000","#d1be88"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/1.3-brimHeight/2.5,brimWidth/2.4,brimHeight/2,-0,180,0,"#AA3333","none"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/1.3-brimHeight/2.5+10,brimWidth/2.4,brimHeight/2,-0,180,0,"#AA3333","none"))
                facePaths.push(this.generate4PointBezier([ref.centerX-brimWidth/1.3,ref.centerY-ref.height/1.3-brimHeight/2.5],
                                                         [ref.centerX-brimWidth/3.4,ref.centerY-ref.height/1.3-brimHeight/2.5],
                                                         [ref.centerX-brimWidth/3.4,ref.centerY-ref.height/1.3-brimHeight/2.5],
                                                         [ref.centerX-brimWidth/1.5,ref.centerY-ref.height/1.3-brimHeight/9], "#AA3333"))
                break
            }case 3:{//Baseball cap red
                let brimWidth = ref.width/1.2*RNG3
                let brimHeight = ref.width/1.9*RNG4
                if (ref.angleX<=0)
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.8,brimHeight/2.5,-90,90,0.03,"#000000","#AA3333"))
                else
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.8,brimHeight/2.5,90,270,0.03,"#000000","#AA3333"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,360,0,"#00000000","#DDDDDD"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight,180,360,0,"#000000","#DDDDDD"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#00000000","#DDDDDD"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5+brimHeight/2.9,brimWidth/1.99,brimHeight*1.34,180,360,0,"#000000","#AA3333"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#000000","none"))
                break
            }case 4:{//Baseball cap gren
                let brimWidth = ref.width/1.2*RNG3
                let brimHeight = ref.width/1.9*RNG4
                if (ref.angleX<=0)
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.8,brimHeight/2.5,-90,90,0.03,"#000000","#33AA33"))
                else
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.8,brimHeight/2.5,90,270,0.03,"#000000","#33AA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,360,0,"#00000000","#DDDDDD"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight,180,360,0,"#000000","#DDDDDD"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#00000000","#DDDDDD"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5+brimHeight/2.9,brimWidth/1.99,brimHeight*1.34,180,360,0,"#000000","#33AA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#000000","none"))
                break
            }case 5:{//Baseball cap bleu
                let brimWidth = ref.width/1.2*RNG3
                let brimHeight = ref.width/1.9*RNG4
                if (ref.angleX<=0)
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.8,brimHeight/2.5,-90,90,0.03,"#000000","#3333AA"))
                else
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.8,brimHeight/2.5,90,270,0.03,"#000000","#3333AA"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,360,0,"#00000000","#DDDDDD"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight,180,360,0,"#000000","#DDDDDD"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#00000000","#DDDDDD"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5+brimHeight/2.9,brimWidth/1.99,brimHeight*1.34,180,360,0,"#000000","#3333AA"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#000000","none"))
                break
            }case 6:{//Baseball cap bee
                let brimWidth = ref.width/1.2*RNG3
                let brimHeight = ref.width/1.9*RNG4
                if (ref.angleX<=0)
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.8,brimHeight/2.5,-90,90,0.03,"#000000","#CCBB22"))
                else
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.8,brimHeight/2.5,90,270,0.03,"#000000","#CCBB22"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,360,0,"#00000000","#222222"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight,180,360,0,"#000000","#222222"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#00000000","#222222"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5+brimHeight/2.9,brimWidth/1.99,brimHeight*1.34,180,360,0,"#000000","#CCBB22"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#000000","none"))
                break
            }case 7:{//hardhat
                let brimWidth = ref.width/1*RNG3
                let brimHeight = ref.width/1.22*RNG4
                if (ref.angleX<=0){
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.3,brimHeight/2.5,-90,90,0.03,"#000000","#CCAA33"))
                }else{
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.3,brimHeight/2.5,90,270,0.03,"#000000","#CCAA33"))
                }
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,360,0,"#00000000","#CCAA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight,180,360,0,"#000000","#CCAA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#000000","#CCAA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/1.3,brimWidth*0.93,brimHeight/2.5,-0,180,0,"#000000","none"))
                if (ref.angleX<=0){
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5-brimHeight/2.4,brimWidth/1.99,brimHeight/2,270,360,0,"#000000","none"))
                    facePaths.push(this.generateCircle(ref.centerX+brimWidth/2,ref.centerY-ref.height/2.5-brimHeight/2.5-brimHeight/2.4,brimWidth/5,0,"#000000","#AABBEE"))
                }else{
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5-brimHeight/2.4,brimWidth/1.99,brimHeight/2,180,270,0,"#000000","none"))
                    facePaths.push(this.generateCircle(ref.centerX-brimWidth/2,ref.centerY-ref.height/2.5-brimHeight/2.5-brimHeight/2.4,brimWidth/5,0,"#000000","#AABBEE"))
                }
                break
            }case 8:{//HELIKOPTER
                let brimWidth = ref.width/1.2*RNG3
                let brimHeight = ref.width/1.9*RNG4
                if (ref.angleX<=0)
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.6,brimHeight/2.5,-90,90,0.03,"#000000","#3333AA"))
                else
                    facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*1.6,brimHeight/2.5,90,270,0.03,"#000000","#3333AA"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,360,0,"#00000000","#33AA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight,180,360,0,"#000000","#33AA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#00000000","#33AA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-90,90,0,"#00000000","#AAAA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/1.5,brimWidth,brimHeight/2.5,-90,90,0,"#00000000","#AAAA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight,270,360,0,"#000000","#AAAA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,90,0,"#00000000","#AAAA33"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5+brimHeight/2.9,brimWidth/1.99,brimHeight*1.34,180,360,0,"#000000","#AA3333"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth,brimHeight/2.5,-0,180,0,"#000000","none"))
                facePaths.push(this.generateOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight*1.44,2,brimWidth/9,0,"#000000","#AABBEE"))
                facePaths.push(this.generateOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight*1.74,brimWidth/3,2,0,"#000000","#AABBEE"))
                break
            }case 9:{//Beaniee
                let brimWidth = ref.width/1*RNG3
                let brimHeight = ref.width/1.1*RNG4
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/9,brimWidth,brimHeight/4.5,-0,360,0,"#00000000","#666666"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/9,brimWidth,brimHeight,180,360,0,"#000000","#666666"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/9,brimWidth,brimHeight/4.5,-0,180,0,"#000000","#666666"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/9,brimWidth*0.15,brimHeight,185,355,0,"#000000","none"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/9,brimWidth*0.5,brimHeight,188,352,0,"#000000","none"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/9,brimWidth*0.75,brimHeight,192,348,0,"#000000","none"))
                facePaths.push(this.generatePartialOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/2.5,brimWidth*0.93,brimHeight/4.5,-0,180,0,"#000000","none"))
                facePaths.push(this.generateOval(ref.centerX,ref.centerY-ref.height/2.5-brimHeight/0.86,brimWidth/6,brimWidth/6,0,"#000000","#666666"))
                break
            }case 10:{//flower
                let brimWidth = ref.width/1*RNG3
                let brimHeight = ref.width/1.1*RNG4
                facePaths.push(this.generateOvalWonky(ref.leftEye[0],ref.leftEye[1]-ref.height/1.7, ref.height/4, ref.height/4,-0.64,"#EEEEEE", "#DDDDDD"))
                facePaths.push(this.generateOvalWonky(ref.leftEye[0],ref.leftEye[1]-ref.height/1.7, ref.height/99, ref.height/99,0,"#EEAA66", "#DDDDDD"))
            }
            
        }
        //glasses (starts from 500)
        let glasses= -1
        for (let i=0; i<accessories.length; i++){
            if (accessories[i]-500 >=0 && accessories[i]-500 <=99){
                glasses = accessories[i]-500
                break
            }  
        }
        switch(glasses){ //(I used a weird format for case here to avoid scope issues + my IDE was being weird)
            case -1: //No 
            default:{
                break
            }case 0:{//distinguised gentlemen
                let glassSize = ref.height/3.1*RNG1
                facePaths.push(this.generateCircleP(ref.leftEye,glassSize,0,"#EECC66"))
                facePaths.push(this.generateLine(ref.leftEye[0]+10+glassSize,ref.leftEye[1],ref.leftEye[0]+glassSize+10,ref.leftEye[1]+glassSize*2,"#EECC66"))
                break
            }case 1:{//Grey square glasses
                let glassSize = ref.width/3.1*RNG1
                let glassCenterPull = ref.width/17*RNG1
                facePaths.push(this.generateOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize,glassSize*0.6,0.2,"#555555","#00226622"))
                facePaths.push(this.generateOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize,glassSize*0.6,0.2,"#555555","#00226622"))
                facePaths.push(this.generate4PointBezier([ref.leftEye[0]-glassCenterPull-glassSize,ref.leftEye[1]],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [ref.rightEye[0]+glassCenterPull+glassSize,ref.rightEye[1]],"#555555"))
                break
            }case 2:{//3d glasses
                let glassSize = ref.width/2.9*RNG1
                let glassCenterPull = ref.width/17*RNG1
                facePaths.push(this.generateOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize,glassSize*0.6,0.25,"#DDDDDD","#88000055"))
                facePaths.push(this.generateOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize,glassSize*0.6,0.25,"#DDDDDD","#00008855"))
                facePaths.push(this.generate4PointBezier([ref.leftEye[0]-glassCenterPull-glassSize,ref.leftEye[1]],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [ref.rightEye[0]+glassCenterPull+glassSize,ref.rightEye[1]],"#DDDDDD"))
                break
            }case 3:{//harry potty
                let glassSize = ref.width/3.1*RNG1
                let glassCenterPull = ref.width/17*RNG1
                facePaths.push(this.generateOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize,glassSize,0,"#111111","#44226644"))
                facePaths.push(this.generateOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize,glassSize,0,"#111111","#44226644"))
                facePaths.push(this.generate4PointBezier([ref.leftEye[0]-glassCenterPull-glassSize,ref.leftEye[1]],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [ref.rightEye[0]+glassCenterPull+glassSize,ref.rightEye[1]],"#111111"))
                break
            }case 4:{//hey beter
                let glassSize = ref.width/5.1*RNG1
                let glassCenterPull = ref.width/17*RNG1
                facePaths.push(this.generateOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize,glassSize,0,"#111111","#44226688"))
                facePaths.push(this.generateOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize,glassSize,0,"#111111","#44226688"))
                facePaths.push(this.generate4PointBezier([ref.leftEye[0]-glassCenterPull-glassSize,ref.leftEye[1]],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [ref.rightEye[0]+glassCenterPull+glassSize,ref.rightEye[1]],"#111111"))
                break
            }case 5:{//red semiframe
                let glassSize = ref.width/3.1*RNG1
                let glassCenterPull = ref.width/17*RNG1
                facePaths.push(this.generatePartialOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize,glassSize*0.6,-20,200,0,"#AA3333","#22222222"))
                facePaths.push(this.generatePartialOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize,glassSize*0.6,-20,200,0,"#AA3333","#22222222"))
                facePaths.push(this.generate4PointBezier([ref.leftEye[0]-glassCenterPull-glassSize,ref.leftEye[1]],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [ref.rightEye[0]+glassCenterPull+glassSize,ref.rightEye[1]],"#AA3333"))
                break
            }case 6:{//avaitor
                let glassSize = ref.width/3.1*RNG1
                let glassCenterPull = ref.width/17*RNG1

                let leftGlass = this.generatePartialOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize,glassSize*0.8,0,180,0,"#999999","#224444AA")
                leftGlass.addPath(this.generatePartialOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize,glassSize*0.5,180,360,0.15,"#999999","#224444AA"))
                leftGlass.addPoint(leftGlass.points[0])
                leftGlass.makeCircular()
                facePaths.push(leftGlass)

                let rightGlass = this.generatePartialOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize,glassSize*0.8,0,180,0,"#999999","#224444AA")
                rightGlass.addPath(this.generatePartialOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize,glassSize*0.5,180,360,0.15,"#999999","#224444AA"))
                rightGlass.addPoint(rightGlass.points[0])
                rightGlass.makeCircular()
                facePaths.push(rightGlass)

                facePaths.push(this.generate4PointBezier([ref.leftEye[0]-glassCenterPull-glassSize,ref.leftEye[1]],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [ref.rightEye[0]+glassCenterPull+glassSize,ref.rightEye[1]],"#999999"))
                break
            }case 7:{//meme sunglass
                let glassSize = ref.width/3.1*RNG1
                let glassCenterPull = ref.width/17*RNG1

                let leftGlass = this.generatePartialOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize,glassSize*0.6,0,180,0.1,"#111111","#222222DD")
                leftGlass.addPath(this.generatePartialOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize,glassSize*0.2,180,360,0.13,"#111111","#222222DD"))
                leftGlass.addPoint(leftGlass.points[0])
                leftGlass.makeCircular()
                facePaths.push(leftGlass)
                facePaths.push(this.generatePartialOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1],glassSize/1.3,glassSize/1.3*0.6,15,70,0.1,"#EEEEEEDD","none")) //shine

                let rightGlass = this.generatePartialOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize,glassSize*0.6,0,180,0.1,"#111111","#222222DD")
                rightGlass.addPath(this.generatePartialOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize,glassSize*0.2,180,360,0.13,"#111111","#222222DD"))
                rightGlass.addPoint(rightGlass.points[0])
                rightGlass.makeCircular()
                facePaths.push(rightGlass)
                facePaths.push(this.generatePartialOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1],glassSize/1.3,glassSize/1.3*0.6,15,70,0.1,"#EEEEEEDD","none"))

                facePaths.push(this.generate4PointBezier([ref.leftEye[0]-glassCenterPull-glassSize,ref.leftEye[1]],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [ref.rightEye[0]+glassCenterPull+glassSize,ref.rightEye[1]],"#111111"))
                break
            }case 8:{//beeg sunglass
                let glassSize = ref.width/3.1*RNG1
                let glassCenterPull = ref.width/17*RNG1

                let leftGlass = this.generatePartialOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1]-glassSize/3,glassSize,glassSize,0,180,0.12,"#111111","#222222DD")
                leftGlass.addPath(this.generatePartialOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1]-glassSize/3,glassSize,glassSize*0.2,180,360,0.15,"#111111","#222222DD"))
                leftGlass.addPoint(leftGlass.points[0])
                leftGlass.makeCircular()
                facePaths.push(leftGlass)
                facePaths.push(this.generatePartialOval(ref.leftEye[0]-glassCenterPull,ref.leftEye[1]-glassSize/3,glassSize/1.3,glassSize/1.3,15,70,0.12,"#EEEEEEDD","none")) //shine

                let rightGlass = this.generatePartialOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1]-glassSize/3,glassSize,glassSize,0,180,0.12,"#111111","#222222DD")
                rightGlass.addPath(this.generatePartialOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1]-glassSize/3,glassSize,glassSize*0.2,180,360,0.15,"#111111","#222222DD"))
                rightGlass.addPoint(rightGlass.points[0])
                rightGlass.makeCircular()
                facePaths.push(rightGlass)
                facePaths.push(this.generatePartialOval(ref.rightEye[0]+glassCenterPull,ref.rightEye[1]-glassSize/3,glassSize/1.3,glassSize/1.3,15,70,0.12,"#EEEEEEDD","none"))

                //holder
                facePaths.push(this.generate4PointBezier([ref.leftEye[0]-glassCenterPull-glassSize,ref.leftEye[1]],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [(ref.leftEye[0]+ref.rightEye[0])/2,ref.leftEye[1]-glassSize/3.5],
                                                         [ref.rightEye[0]+glassCenterPull+glassSize,ref.rightEye[1]],"#111111"))
                break
            }
        }
        
        
        return facePaths
    }

    

    //smudge area of multiple paths
    //allPaths should be an array of paths
    smudgeAreas(allPaths, centerX, centerY, smudgeWidth, smudgeHeight, smudgeX, smudgeY, ctx=null){
        allPaths.forEach(path => {
            path.smudgeArea(centerX, centerY, smudgeWidth, smudgeHeight, smudgeX, smudgeY, ctx)
        });
    }

    //given two points, find the third point that forms a triangle with the two points as the base of an isosceles triangle
    //extension sets the distance from the third point to the base (proportional to length from p1 to p2)
    //the third point is in the direction clockwise from the vector p1 to p2
    trianglePoint(p1, p2, extension){
        let distance = util.dist(p1, p2)
        let dx = p2[0] - p1[0]
        let dy = p2[1] - p1[1]
        let baseX = dx/2 
        let baseY = dy/2 
        let angle = Math.atan2(dx,dy) - Math.PI/2
        let extendLength = extension * distance

        let finalX = p1[0] + baseX + Math.sin(angle) * extendLength
        let finalY = p1[1] + baseY + Math.cos(angle) * extendLength

        return [finalX, finalY]
    }
}

module.exports = {
    Generator: Generator
}
},{"./path.js":7,"./ref.js":8,"./util.js":10}],3:[function(require,module,exports){
/* globals document, ImageData */

const parseFont = require('./lib/parse-font')

exports.parseFont = parseFont

exports.createCanvas = function (width, height) {
  return Object.assign(document.createElement('canvas'), { width: width, height: height })
}

exports.createImageData = function (array, width, height) {
  // Browser implementation of ImageData looks at the number of arguments passed
  switch (arguments.length) {
    case 0: return new ImageData()
    case 1: return new ImageData(array)
    case 2: return new ImageData(array, width)
    default: return new ImageData(array, width, height)
  }
}

exports.loadImage = function (src, options) {
  return new Promise(function (resolve, reject) {
    const image = Object.assign(document.createElement('img'), options)

    function cleanup () {
      image.onload = null
      image.onerror = null
    }

    image.onload = function () { cleanup(); resolve(image) }
    image.onerror = function () { cleanup(); reject(new Error('Failed to load the image "' + src + '"')) }

    image.src = src
  })
}

},{"./lib/parse-font":4}],4:[function(require,module,exports){
'use strict'

/**
 * Font RegExp helpers.
 */

const weights = 'bold|bolder|lighter|[1-9]00'
const styles = 'italic|oblique'
const variants = 'small-caps'
const stretches = 'ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded'
const units = 'px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q'
const string = '\'([^\']+)\'|"([^"]+)"|[\\w\\s-]+'

// [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]?
//    <‘font-size’> [ / <‘line-height’> ]? <‘font-family’> ]
// https://drafts.csswg.org/css-fonts-3/#font-prop
const weightRe = new RegExp(`(${weights}) +`, 'i')
const styleRe = new RegExp(`(${styles}) +`, 'i')
const variantRe = new RegExp(`(${variants}) +`, 'i')
const stretchRe = new RegExp(`(${stretches}) +`, 'i')
const sizeFamilyRe = new RegExp(
  `([\\d\\.]+)(${units}) *((?:${string})( *, *(?:${string}))*)`)

/**
 * Cache font parsing.
 */

const cache = {}

const defaultHeight = 16 // pt, common browser default

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object} Parsed font. `size` is in device units. `unit` is the unit
 *   appearing in the input string.
 * @api private
 */

module.exports = str => {
  // Cached
  if (cache[str]) return cache[str]

  // Try for required properties first.
  const sizeFamily = sizeFamilyRe.exec(str)
  if (!sizeFamily) return // invalid

  // Default values and required properties
  const font = {
    weight: 'normal',
    style: 'normal',
    stretch: 'normal',
    variant: 'normal',
    size: parseFloat(sizeFamily[1]),
    unit: sizeFamily[2],
    family: sizeFamily[3].replace(/["']/g, '').replace(/ *, */g, ',')
  }

  // Optional, unordered properties.
  let weight, style, variant, stretch
  // Stop search at `sizeFamily.index`
  const substr = str.substring(0, sizeFamily.index)
  if ((weight = weightRe.exec(substr))) font.weight = weight[1]
  if ((style = styleRe.exec(substr))) font.style = style[1]
  if ((variant = variantRe.exec(substr))) font.variant = variant[1]
  if ((stretch = stretchRe.exec(substr))) font.stretch = stretch[1]

  // Convert to device units. (`font.unit` is the original unit)
  // TODO: ch, ex
  switch (font.unit) {
    case 'pt':
      font.size /= 0.75
      break
    case 'pc':
      font.size *= 16
      break
    case 'in':
      font.size *= 96
      break
    case 'cm':
      font.size *= 96.0 / 2.54
      break
    case 'mm':
      font.size *= 96.0 / 25.4
      break
    case '%':
      // TODO disabled because existing unit tests assume 100
      // font.size *= defaultHeight / 100 / 0.75
      break
    case 'em':
    case 'rem':
      font.size *= defaultHeight / 0.75
      break
    case 'q':
      font.size *= 96 / 25.4 / 4
      break
  }

  return (cache[str] = font)
}

},{}],5:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"./lib/parse-font":6,"dup":3}],6:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],7:[function(require,module,exports){
//path class
//this class should be the main manager of all points that would be drawn
//each instance of Path can have points added to it, drawing mode configured, smudged, smoothed, and drawn given a ctx object
//
const{Util} = require("./util.js") 
var util = new Util()

class Path{
    points = [] //private path variable to store path
    circular = false

    constructor(strokeStyle = "#000000", fillStyle="none"){
        this.strokeStyle = strokeStyle
        this.fillStyle = fillStyle
    } //empty constructor

    // add point functions: option to use x,y coordinates or use [x,y] array
    addPoint(x, y){
        if(isNaN(x) || isNaN(y)){
            throw "new point must use numeric x and y values!"
        }
        this.points.push([x,y])
    }

    addPoint(pointArray){
        if(!Array.isArray(pointArray) || pointArray.length != 2 || isNaN(pointArray[0]) || isNaN(pointArray[1])){
            throw "new point must be a validly formed array! [xValue, yValue]"
        }
        this.points.push(pointArray)
    }

    //add all the points of a different path to this one (not thouroughly tested btw)
    addPath(path){
        path.points.forEach(point => {
            this.points.push(point)
        });
    }

    addPathBefore(path){
        path.points.reverse().forEach(point => {
            this.points.unshift(point)
        });
    }

    setStrokeStyle(strokeStyle){
        this.strokeStyle = strokeStyle
    }

    setFillStyle(fillStyle){
        this.fillStyle = fillStyle
    }

    // smudge all points in an area
    // smudgeX and smudgeY intensify smudging at a linear rate with distance to center of smudge array
    // if draw ctx is specified, a circle indicating the smudge area is create for debug
    smudgeArea(centerX, centerY, radiusX, radiusY, smudgeX, smudgeY, ctx = null){
        let dirX = smudgeX/Math.abs(smudgeX)
        let dirY = smudgeY/Math.abs(smudgeY)
    
        if(isNaN(dirX)) dirX = 1;
        if(isNaN(dirY)) dirY = 1;
    
        let magX = smudgeX*dirX
        let magY = smudgeY*dirY
        
        this.points.forEach(point => {
            let x2 = Math.pow(point[0] - centerX, 2)
            let y2 = Math.pow(point[1] - centerY, 2)
            let rx2 = Math.pow(radiusX, 2)
            let ry2 = Math.pow(radiusY, 2)
            let ratio = x2/rx2 + y2/ry2
    
            if(ratio < 1){ // previously scaled improperly with size, numbers now are relative to the testing scale
                point[0] = point[0] + Math.pow((1-ratio)*220*magX, 1.5)*dirX*radiusX/220
                point[1] = point[1] + Math.pow((1-ratio)*200*magY, 1.5)*dirY*radiusY/200
            }
        })
    
        if(ctx != null){ //debug: shows the smudge elipse
            let prevFillStyle = ctx.fillStyle
            ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 360*radian)
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = prevFillStyle;
        }
    }
    
    //introduce random jitter with specified xVar and yVar as max varied distance
    addNoise(xVar, yVar, drawSeed){
        let drawUtil = new Util()
        drawUtil.seed("" + drawSeed)

        this.points.forEach(point => {
            drawUtil.seededVaryPoint(point, xVar, yVar)
        })
    }

    // explicitly mark shape as circular
    makeCircular(){
        this.circular = true
    }
    // make each point the average of the previous, current, and next point (first and last point unmoved)
    // if the path is marked circular, the first and last point is also averaged accordingly
    smoothPoints(circularSmooth = false){
        let circular = this.circular || circularSmooth
        let prev = this.points[0]
        for(let i = 1; i < this.points.length-1; i++){
            let tempCur = [this.points[i][0],this.points[i][1]]
            let next = this.points[i+1]
            this.points[i][0] = (prev[0] + tempCur[0] + next[0])/3
            this.points[i][1] = (prev[1] + tempCur[1] + next[1])/3
            prev = tempCur
        }

        if(circular && this.points.length > 2){
            let l = this.points.length
            let p2 = this.points[1]
            let p1 = this.points[0] //first point
            let p9 = this.points[l-1] //last point
            let p8 = this.points[l-2]
            this.points[0][0] = (p2[0] + p1[0] + p9[0])/3
            this.points[0][1] = (p2[1] + p1[1] + p9[1])/3
            this.points[l-1][0] = (p1[0] + p9[0] + p8[0])/3
            this.points[l-1][1] = (p1[1] + p9[1] + p8[1])/3
        }
    }

    // reverse the order of all the points
    reversePath(){
        let newPathPoints = []
        this.points.forEach(point => {
            newPathPoints.unshift(point)
        })
        this.points = newPathPoints
    }

    // basic draw function to draw through all points line by line (can add different types of draw later)
    draw(drawCtx, lineWidth, markPoints=false, offsetX=0, offsetY=0, scale=1.0){
        drawCtx.lineWidth = lineWidth*scale;

        if(this.fillStyle != "none"){
            drawCtx.moveTo(this.points[0][0]*scale+offsetX, this.points[0][1]*scale+offsetY)
            drawCtx.beginPath()
            drawCtx.fillStyle = this.fillStyle;
            this.points.forEach((point) => {
                drawCtx.lineTo(point[0]*scale+offsetX, point[1]*scale+offsetY)
            });
            drawCtx.closePath()
            drawCtx.fillStyle = this.fillStyle
            drawCtx.fill()
        }
        
        drawCtx.strokeStyle = this.strokeStyle;
        let prevPoint = this.points[0];
        this.points.forEach((point) => {
            drawCtx.beginPath()
            drawCtx.moveTo(prevPoint[0]*scale+offsetX,prevPoint[1]*scale+offsetY)
            drawCtx.lineCap = 'round';
            drawCtx.lineTo(point[0]*scale+offsetX, point[1]*scale+offsetY)
            drawCtx.stroke()
            prevPoint = point
        });

        //debug: mark every point in the path
        if(markPoints){
            let prevStyle = drawCtx.fillStyle
            this.points.forEach((point) => {
                drawCtx.fillStyle = "#FF0000";
                drawCtx.beginPath();
                drawCtx.arc(point[0]*scale+offsetX, point[1]*scale+offsetY, 1, 0, 2 * Math.PI, false);
                drawCtx.fill()
            });
            drawCtx.fillStyle = prevStyle
        }
    }
}

module.exports = {
    Path: Path
}
},{"./util.js":10}],8:[function(require,module,exports){
//ref class:
//this class holds all the metadata regarding the coordinates related to a head's shape
//all constant factors of a chibi's head should be put here (+ rotation etc)
const{Util} = require("./util.js") 

class Ref{
    constructor(cX=1000, cY=1000, baseSeed= Math.floor(Math.random()*1000000), ctx=null){

        //utilities
        this.ctx = ctx
        this.util = new Util(ctx)
        this.baseSeed = baseSeed

        // list of available options [101 - angry shadow temporarily disabled for later layering fixes]
        this.allAccessories = [100,102,200,201,202,300,301,302,303,304,305,306,400,401,402,403,404,405,406,407,408,409,410,500,501,502,503,504,505,506,507,508] 
        this.allEyes = [0,1,2,3,4,5,6,7,8,9,10,100,101,102,103,104,105,106]
        this.allMouths = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,100,101,102,103,104,105]

        //basic stats
        this.centerX = cX
        this.centerY = cY
        //offset, used by renderer
        this.offsetX = 0
        this.offsetY = 0

        //draw seed: control wiggle of draw
        this.drawSeed = 0

        this.setAllSeededValues(this.baseSeed)
    }

    setAllSeededValues(seed){
        this.baseSeed = seed
        this.util = new Util(this.ctx)
        this.util.seed("" + this.baseSeed)
        this.widthScale = this.util.prop(0.8,1.75,this.util.seededRand())
        this.lineWidth = Math.floor(this.util.prop(Math.floor(this.util.prop(10,26,this.util.seededRand())),26,this.util.seededRand()))

        this.angleX = Math.floor(this.util.prop(-20,20.9999,this.util.seededRand())) 
        this.angleY = Math.floor(this.util.prop(-25,-5.0001,this.util.seededRand())) 

        this.updateScale(this.util.prop(100,360,this.util.seededRand()))

        this.hairColor = this.rgbToHex(Math.floor(this.util.prop(0,255.999,this.util.seededRand())),Math.floor(this.util.prop(0,255.999,this.util.seededRand())),Math.floor(this.util.prop(0,255.999,this.util.seededRand())))
        let skinTone = this.util.prop(this.util.propC(1,6,this.util.seededRand()),7.5,this.util.seededRand())
        let r = Math.min(255, Math.floor(skinTone * this.util.prop(43,47,this.util.seededRand())))
        let g = Math.min(255, Math.floor(skinTone * this.util.prop(32,35,this.util.seededRand())))
        let b = Math.min(255, Math.floor(skinTone * this.util.prop(28,32,this.util.seededRand())))
        this.faceColor = this.rgbToHex(r,g,b)

        this.eyeSeperation = this.util.prop(0.3,0.9,this.util.seededRand())
        // 1 = half of face's X len
        this.eyeHeight = this.util.prop(-0.09,-0.03,this.util.seededRand())
        // 1 = half of face's Y height
        this.mouthHeight = this.util.prop(-0.40,-0.20,this.util.seededRand())
        // 1 = half of face's Y height
        //All of the seperation factor calculates from the point of the front of the face

        this.mouthStyle = this.allMouths[Math.floor(this.util.prop(0,this.allMouths.length,this.util.seededRand()))]
        this.eyeStyle = this.allEyes[Math.floor(this.util.prop(0,this.allEyes.length,this.util.seededRand()))]
        this.accessories = []
        if(this.util.seededRand() < 0.75){ 
            this.accessories.push(this.allAccessories[Math.floor(this.util.prop(0,this.allAccessories.length,this.util.seededRand()))])
        }

        this.setRandoms()
        this.updatePoints()
    }

    setCenter(x, y){
        this.centerX = x
        this.centerY = y
    }

    updateScale(scale){
        this.scale = scale
        this.width = this.widthScale*this.scale
        this.height = this.scale
        this.length = this.scale*(this.widthScale+1)/2
        this.updatePoints()
    }

    setRandoms(){
        //seed faceShapeRandom ytf

        //randomness references, other generation function may reference these
        this.eyeRand1 = this.util.seededRand()
        this.eyeRand2 = this.util.seededRand()
        this.eyeRand3 = this.util.seededRand()
        this.eyeRand4 = this.util.seededRand()

        this.mouthRand1 = this.util.seededRand()
        this.mouthRand2 = this.util.seededRand()
        this.mouthRand3 = this.util.seededRand()
        this.mouthRand4 = this.util.seededRand()

        this.accRand1 = this.util.seededRand()
        this.accRand2 = this.util.seededRand()
        this.accRand3 = this.util.seededRand()
        this.accRand4 = this.util.seededRand()

        this.hairlineHeight = this.util.seededRand()
        this.hairLength = this.util.seededRand()

        this.isStraightBang = this.util.seededRand()
        this.bangEdgeCurves = [this.util.seededRand(), this.util.seededRand()]
        this.hairType = [this.util.seededRand(), this.util.seededRand(), this.util.seededRand()]
        this.hairRand = [this.util.seededRand(), this.util.seededRand(), this.util.seededRand()]
        this.bangSegmentRand = [[this.util.seededRand(), this.util.seededRand(), this.util.seededRand(), this.util.seededRand()],
                                [this.util.seededRand(), this.util.seededRand(), this.util.seededRand(), this.util.seededRand()],
                                [this.util.seededRand(), this.util.seededRand(), this.util.seededRand(), this.util.seededRand()]]
        this.hairMiscRand = [this.util.seededRand(), this.util.seededRand(), this.util.seededRand(), this.util.seededRand(), this.util.seededRand()]
        this.topAnchorCount = this.util.seededRand()

        this.faceVX = this.util.seededRand() //for shifting the face very slightly randomly
        this.faceVY = this.util.seededRand()

        this.headRoundedness = (this.util.seededRand()**2)//favor unround heads
        this.cheekBulge = this.util.seededRand()
        this.chinBulge = this.util.seededRand()
    }

    //update points for after angles are changed
    updatePoints(){
        this.faceAngleDirX = this.angleX/Math.abs(this.angleX) // direction [-1/1] of face
        if(isNaN(this.faceAngleDirX)) this.faceAngleDirX = 0

        //[X angle, Y angle] (deviating from the center of the circle)
        //X angle limit: -20/20 deg, Y angle limit -5/-25 deg
        this.zOffset = [this.length*Math.sin(this.angleX*radian) , this.length*Math.sin(this.angleY*radian)]
        //[Z Offset X, Z Offset Y] (Orthagonal based projection)
        //Z offset determines the front and backmost point of head

        //coordinates of reference points
        this.HEAD_CENTER = [this.centerX,this.centerY]
        this.HEAD_RIGHT = [this.centerX+this.width,this.centerY]
        this.HEAD_LEFT = [this.centerX-this.width,this.centerY]
        this.HEAD_TOP = [this.centerX,this.centerY-this.height]
        this.HEAD_BOTTOM = [this.centerX,this.centerY+this.height]
        this.HEAD_FRONT = [this.centerX-this.zOffset[0],this.centerY-this.zOffset[1]]
        this.HEAD_BACK = [this.centerX+this.zOffset[0],this.centerY+this.zOffset[1]]

        // face point + introduce randomized shift
        this.face = [this.centerX-this.zOffset[0], this.centerY-this.zOffset[1]]
        let faceVaryX = this.util.propC(-this.width/8,this.width/8,this.faceVX)
        let faceVaryY = this.util.propC(-this.height/8,this.height/8,this.faceVY)
        this.util.movePoint(this.face, faceVaryX, faceVaryY)

        // face angle adjustments for eyes and mouth
        let xAngleAdjustment = this.angleX*1.2
        let yAngleAdjustment = this.angleY*this.height/300+(this.width/200*15)


        //Compensate for the angle and the dist. betweem eyes
        this.leftEye = [(this.face[0]+this.eyeSeperation*this.width)+xAngleAdjustment, this.face[1]-this.eyeHeight*this.height]
        this.leftBrow = [this.leftEye[0], this.leftEye[1]-this.height/3]
        this.rightEye = [(this.face[0]-this.eyeSeperation*this.width)+xAngleAdjustment,this.face[1]-this.eyeHeight*this.height]
        this.rightBrow = [this.rightEye[0], this.rightEye[1]-this.height/3]

        // mouth points
        this.mouth = [this.face[0],(this.face[1]-this.mouthHeight*this.height)+yAngleAdjustment]
    }

    //change the line wiggle when drawn
    wiggle(){
        this.drawSeed += 1
    }

    // hex conversion methods courtesy of https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
      
    rgbToHex(r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
    }

    DrawRefPoints(){
        if(ctx == null){
            throw "trying to draw ref on ref without ctx!"
        }
        this.util.dot(this.ctx, this.HEAD_RIGHT[0],this.HEAD_RIGHT[1]);
        this.util.dot(this.ctx, this.HEAD_LEFT[0],this.HEAD_LEFT[1]);
        this.util.dot(this.ctx, this.HEAD_TOP[0],this.HEAD_TOP[1]);
        this.util.dot(this.ctx, this.HEAD_BOTTOM[0],this.HEAD_BOTTOM[1]);           //These are edge of head
        this.util.dot(this.ctx, this.HEAD_CENTER[0],this.HEAD_CENTER[1]);                        //Center point
        this.util.dot(this.ctx, this.HEAD_FRONT[0],this.HEAD_FRONT[1]);  //Back head point
        this.util.dot(this.ctx, this.HEAD_BACK[0],this.HEAD_BACK[1]);  //Front face point
    }

    // fuse the traits of this chibi with another, randomly selecting or averaging traits from each parent
    fuse(ref2){
        this.baseSeed = this.baseSeed + "." + ref2.baseSeed
        this.util = new Util(this.ctx)
        this.util.seed("" + this.baseSeed)

        // inherit scale and angle
        this.widthScale = this.util.randInherit(this.widthScale, ref2.widthScale, 0.4, 0.2)
        this.lineWidth = this.util.randInherit(this.lineWidth, ref2.lineWidth, 0.4, 0.2)
        this.angleX = this.util.randInherit(this.angleX, ref2.angleX, 0.4, 0.2) 
        this.angleY = this.util.randInherit(this.angleY, ref2.angleY, 0.4, 0.2)

        this.updateScale(this.util.prop(100,360,this.util.seededRand()))

        // hair Color conversion and inherit
        var myRGB = this.hexToRgb(this.hairColor)
        var yourRGB = this.hexToRgb(ref2.hairColor)

        var p1Bias = this.util.randInherit(0, 1, 0.4, 0.2)
        var newR = Math.floor(myRGB.r * p1Bias + yourRGB.r * (1-p1Bias))
        var newG = Math.floor(myRGB.g * p1Bias + yourRGB.g * (1-p1Bias))
        var newB = Math.floor(myRGB.b * p1Bias + yourRGB.b * (1-p1Bias))

        this.hairColor = this.rgbToHex(newR, newG, newB)
        
        // face Color conversion and inherit
        var myRGB = this.hexToRgb(this.faceColor)
        var yourRGB = this.hexToRgb(ref2.faceColor)

        var p1Bias = this.util.randInherit(0, 1, 0.4, 0.2)
        var newR = Math.floor(myRGB.r * p1Bias + yourRGB.r * (1-p1Bias))
        var newG = Math.floor(myRGB.g * p1Bias + yourRGB.g * (1-p1Bias))
        var newB = Math.floor(myRGB.b * p1Bias + yourRGB.b * (1-p1Bias))

        this.faceColor = this.rgbToHex(newR, newG, newB)

        // inherit some facial features
        this.eyeSeperation = this.util.randInherit(this.eyeSeperation, ref2.eyeSeperation, 0.4, 0.2)
        this.eyeHeight = this.util.randInherit(this.eyeHeight, ref2.eyeHeight, 0.4, 0.2)
        this.mouthHeight = this.util.randInherit(this.mouthHeight, ref2.mouthHeight, 0.4, 0.2)

        // inherit random discrete features
        this.mouthStyle = [this.mouthStyle, ref2.mouthStyle][Math.floor(this.util.seededRand() * 2)]
        this.eyeStyle = [this.eyeStyle, ref2.eyeStyle][Math.floor(this.util.seededRand() * 2)]

        this.accessories.push.apply(this.accessories, ref2.accessories)
        let newAccessories = []
        if(this.accessories.length > 0){
            newAccessories.push(this.accessories[Math.floor(this.util.seededRand() * this.accessories.length)])
        }
        this.accessories = newAccessories

        // inherit rest of the face features
        this.eyeRand1 = this.util.randInherit(this.eyeRand1, ref2.eyeRand1, 0.4, 0.2)
        this.eyeRand2 = this.util.randInherit(this.eyeRand2, ref2.eyeRand2, 0.4, 0.2)
        this.eyeRand3 = this.util.randInherit(this.eyeRand3, ref2.eyeRand3, 0.4, 0.2)
        this.eyeRand4 = this.util.randInherit(this.eyeRand4, ref2.eyeRand4, 0.4, 0.2)

        this.mouthRand1 = this.util.randInherit(this.mouthRand1, ref2.mouthRand1, 0.4, 0.2)
        this.mouthRand2 = this.util.randInherit(this.mouthRand2, ref2.mouthRand2, 0.4, 0.2)
        this.mouthRand3 = this.util.randInherit(this.mouthRand3, ref2.mouthRand3, 0.4, 0.2)
        this.mouthRand4 = this.util.randInherit(this.mouthRand4, ref2.mouthRand4, 0.4, 0.2)

        this.accRand1 = this.util.randInherit(this.accRand1, ref2.accRand1, 0.4, 0.2)
        this.accRand2 = this.util.randInherit(this.accRand2, ref2.accRand2, 0.4, 0.2)
        this.accRand3 = this.util.randInherit(this.accRand3, ref2.accRand3, 0.4, 0.2)
        this.accRand4 = this.util.randInherit(this.accRand4, ref2.accRand4, 0.4, 0.2)

        this.hairlineHeight = this.util.randInherit(this.hairlineHeight, ref2.hairlineHeight, 0.4, 0.2)
        this.hairLength = this.util.randInherit(this.hairLength, ref2.hairLength, 0.4, 0.2)

        this.isStraightBang = this.util.randInherit(this.isStraightBang, ref2.isStraightBang, 0.4, 0.2)
        this.topAnchorCount = this.util.randInherit(this.topAnchorCount, ref2.topAnchorCount, 0.4, 0.2)

        this.faceVX = this.util.randInherit(this.faceVX, ref2.faceVX, 0.4, 0.2) //for shifting the face very slightly randomly
        this.faceVY = this.util.randInherit(this.faceVY, ref2.faceVY, 0.4, 0.2)

        this.headRoundedness = this.util.randInherit(this.headRoundedness, ref2.headRoundedness, 0.4, 0.2)//favor unround heads
        this.cheekBulge = this.util.randInherit(this.cheekBulge, ref2.cheekBulge, 0.4, 0.2)
        this.chinBulge = this.util.randInherit(this.chinBulge, ref2.chinBulge, 0.4, 0.2)
    }
}

module.exports = {
    Ref: Ref
}
},{"./util.js":10}],9:[function(require,module,exports){
// UTIL FUNC
const{Builder} = require("./builder.js") 
const{Path} = require("./path.js") 
const{Util} = require("./util.js") 
const{Ref} = require("./ref.js") 
const{Generator} = require("./generator.js") 
const{createCanvas} = require('Canvas')

console.log(typeof Path)
console.log(typeof Util)
console.log(typeof Builder)
console.log(typeof Builder.render)

builder = new Builder()

ctxElement = document.getElementById("Canvas");
ctx = ctxElement.getContext("2d");
const canvas = document.querySelector('Canvas')
const rect = canvas.getBoundingClientRect()

// global vars and settings
chibis = []

initialized = false
x = 0
y = 0
width = rect.width
height = rect.width

refreshRate = 20
ticksPerWiggle = 4
ticks = 1

// keep track of which chibis are touched by mouse (first two), and grabbed (for dragging)
touchChibi1 = -1
touchChibi2 = -1
grabChibi = -1

// triggers every frame
function gameTick(){
    ctx.fillStyle = "rgb(250,250,250)"
    ctx.fillRect(-10, -10, width, height)

    if(!initialized){
        initalizeGame()
        initialized = true
    }

    for(let i = 0; i < chibis.length; i++){
        if(grabChibi != i){
            builder.render(ctx, chibis[i], chibis[i].offsetX, chibis[i].offsetY, 0.12)
        }
    }
    if(grabChibi >= 0){
        builder.render(ctx, chibis[grabChibi], chibis[grabChibi].offsetX, chibis[grabChibi].offsetY, 0.12)
    }

    if(ticks >= ticksPerWiggle){
        for(let i = 0; i < chibis.length; i++){
            chibis[i].wiggle()
        }
        ticks = 0
    }
    
    console.log(grabChibi + " " + touchChibi1 + " " + touchChibi2)
    // draw top layer
    ctx.fillStyle = "rgb(0,0,0)"
    ctx.strokeStyle = "rgb(0,0,0)"
    newLine(100,70,900,70)
    newStrokeText(500,50,"Mochibi", "60px Arial")

    // set game tick and schedule next tick
    ticks += 1
    setTimeout(gameTick, refreshRate); //around 30 fps
}
gameTick()


function initalizeGame(){
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
            let newRef = new Ref(0, 0)
            newRef.offsetX = 200+200*j
            newRef.offsetY = 200+200*i
            newRef.updateScale(350)
            chibis.push(newRef)
        }
    }
}

function updateCursorPosition(canvas, event) {
    x = Math.round(event.clientX - rect.left - 10)
    y = Math.round(event.clientY - rect.top - 10)
    
    touchChibi1 = -1
    touchChibi2 = -1
    
    for(let i = chibis.length-1; i >= 0; i--){
        let chib = chibis[i]

        if(Math.abs(chib.offsetX - x) < 40 && Math.abs(chib.offsetY - y) < 40){
            if(touchChibi1 == -1){
                touchChibi1 = i
            }else{
                touchChibi2 = i
            }
        }
    }

    if(grabChibi >= 0){
        chibis[grabChibi].offsetX = x
        chibis[grabChibi].offsetY = y
    }
}

canvas.addEventListener('mousedown', function(e) {
    updateCursorPosition(canvas, e)
    grabChibi = touchChibi1
})

canvas.addEventListener('mousemove', (e) => {
    updateCursorPosition(canvas, e)
});

canvas.addEventListener('mouseup', function(e) {
    updateCursorPosition(canvas, e)

    if(grabChibi >= 0 && touchChibi1 >= 0 && touchChibi2 >= 0){
        let theOther = (grabChibi == touchChibi1 ? touchChibi2 : touchChibi1)

        chibis[Math.min(grabChibi,theOther)].fuse(chibis[Math.max(grabChibi,theOther)])
        chibis[Math.min(grabChibi,theOther)].updateScale(350)
        chibis.splice(Math.max(grabChibi,theOther), 1)
    }
    grabChibi = -1
})





function newLine(x1,y1,x2,y2){
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}
function newStrokeText(x1,y1,text,style){
    ctx.font = style;
    ctx.textAlign = "center";
    ctx.fillText(text,x1,y1)
}
function newText(x1,y1,text,style){
    ctx.font = style;
    ctx.textAlign = "center";
    ctx.fillText(text,x1,y1)
}
function newRect(x,y,w,h,lineWidth){
    ctx.rect(x,y,w,h)
    ctx.lineWidth = lineWidth;
    ctx.fillStyle="black"
    ctx.stroke();
}
// function newImg(x,y,w,h,path){
//     const { createCanvas, loadImage } = require("canvas");
//     loadImage(path).then((image) => {
//         context.drawImage(image, 425, 225);
//         const buffer = canvas.toBuffer("image/png");
//         fs.writeFileSync("./image.png", buffer);
//     });
//     drawImage(path, x, y, w, h)
// }



},{"./builder.js":1,"./generator.js":2,"./path.js":7,"./ref.js":8,"./util.js":10,"Canvas":3}],10:[function(require,module,exports){
//util class:
//the place for general utility functions
//most contains basic debug drawing tool, and randomization helpers
class Util{
    constructor(){}

    dot(ctx, x, y, size=5){
        let fill = ctx.fillStyle;
        ctx.beginPath();
        ctx.fillStyle = "#FF0000";
        ctx.arc(x, y, size, 0, 2 * Math.PI, false);
        ctx.fill()
        ctx.fillStyle = fill
    }

    //INCLUSIVE [0 to end]
    randInt(end){
        return this.randRange(0, end)
    }
    //also INCLUSIVE
    randRange(start, end){
        return start+Math.floor(Math.random()*(end+1-start))
    }
    //random gaussian value [0,1] with mean 0
    randGauss() {
        let u = 1 - Math.random(), v = 1 - Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u))*Math.cos(v*2*Math.PI);
        num = num/10+0.5;
        if (num > 1 || num < 0) return randn_bm()
        return num
      }
    //vary point by random distance xVar yVar
    varyPoint(point, xVar, yVar){
        point[0] = point[0] + Math.floor((xVar*2+1)*Math.random()) - xVar
        point[1] = point[1] + Math.floor((yVar*2+1)*Math.random()) - yVar
    }
    //vary point by random distance xVar yVar
    seededVaryPoint(point, xVar, yVar){
        point[0] = point[0] + Math.floor((xVar*2+1)*this.seededRand()) - xVar
        point[1] = point[1] + Math.floor((yVar*2+1)*this.seededRand()) - yVar
    }
    //move point by dx, dy
    movePoint(point, dx, dy){
        point[0] = point[0] + dx
        point[1] = point[1] + dy
    }
    //given a range and a proportion, return value on range linearly
    prop(start, end, proportion){
        return start+(end-start)*proportion
    }
    //given a range and a proportion, return value on range with high bias towards center
    propC(start, end, proportion){
        let realProportion = (Math.pow(2*proportion-1,5)+1)/2
        return start+(end-start)*realProportion
    }

    //given the value of two parent values, and the chance for p1 to be inherited/chance for p1+p2 to be fused, (p2 inherit chance inferred)
    //return the value the son receives
    randInherit(p1Val, p2Val, p1Chance, fuseChance){
        let rand = this.seededRand()
        if(rand <= p1Chance){
            return p1Val
        }else if(rand <= p1Chance + fuseChance){
            return (p1Val+p2Val)/2
        }
        return p2Val
    }

    //distance
    dist(p1, p2){
        return Math.sqrt((p1[0]-p2[0])**2+(p1[1]-p2[1])**2)
    }

    //interpolate point: given two points and a ratio, return a point that is that ratio down from the first to second point
    interpolatePoint(p1, p2, ratio){
        return [p1[0]+(p2[0]-p1[0])*ratio,p1[1]+(p2[1]-p1[1])*ratio]
    }

    //seeded random utils:
    //referenced – https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    xmur3(str) {
        var h
        for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = h << 13 | h >>> 19;
        } return function() {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }
    }

    sfc32(a, b, c, d) {
        return function() {
          a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
          var t = (a + b) | 0;
          a = b ^ b >>> 9;
          b = c + (c << 3) | 0;
          c = (c << 21 | c >>> 11);
          d = d + 1 | 0;
          t = t + d | 0;
          c = c + t | 0;
          return (t >>> 0) / 4294967296;
        }
    }

    seed(seed){ //seed a random
        this.seed = this.xmur3(seed)
        this.rand = this.sfc32(this.seed(), this.seed(), this.seed(), this.seed());
    }

    seededRand(){ //use seeded random
        if(this.rand == undefined){
            throw "Attempted to use seeded rand without seeding first!"
        }else{
            return this.rand()
        }
    }
}

module.exports = {
    Util: Util
}
},{}],11:[function(require,module,exports){

},{}]},{},[9,1,2,7,8,10]);
