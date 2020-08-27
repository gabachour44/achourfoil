from flask import Flask, render_template, request, jsonify
import numpy as np
import functools
from threading import Thread
#import xfoil_module as xfoil
from xfoil import XFoil
from xfoil.model import Airfoil
import matplotlib.pyplot as plt
from scipy.signal import savgol_filter



def PolyArea(x,y):
    return 0.5*np.abs(np.dot(x,np.roll(y,1))-np.dot(y,np.roll(x,1)))

def quadraticBezier(t,points):
    B_x=(1-t)*((1-t)*points[0][0]+t*points[1][0])+t*((1-t)*points[1][0]+t*points[2][0])
    B_y=(1-t)*((1-t)*points[0][1]+t*points[1][1])+t*((1-t)*points[1][1]+t*points[2][1])
    return B_x,B_y

def airfoil(ctlPtsX, ctlPtsY, numPts):

    t=np.array([i*1/numPts for i in range(0,numPts)])


    
    # calculate first Bezier curve
    midX=(ctlPtsX[1]+ctlPtsX[2])/2
    midY=(ctlPtsY[1]+ctlPtsY[2])/2
    B_x,B_y=quadraticBezier(t,[[ctlPtsX[0], ctlPtsY[0]] ,[ctlPtsX[1], ctlPtsY[1]], [midX,midY]])
    bezierX = B_x
    bezierY = B_y

    

    # calculate middle Bezier Curves
    for i in range(1,len(ctlPtsX)-3):

        midX_1=(ctlPtsX[i]+ctlPtsX[i+1])/2
        midY_1=(ctlPtsY[i]+ctlPtsY[i+1])/2
        midX_2=(ctlPtsX[i+1]+ctlPtsX[i+2])/2
        midY_2=(ctlPtsY[i+1]+ctlPtsY[i+2])/2

        B_x,B_y=quadraticBezier(t,[[midX_1,midY_1],[ctlPtsX[i+1], ctlPtsY[i+1]],[midX_2,midY_2]])
        bezierX = np.concatenate((bezierX, B_x))
        bezierY = np.concatenate((bezierY, B_y))                
   
    # calculate last Bezier curve
    midX=(ctlPtsX[-3]+ctlPtsX[-2])/2
    midY=(ctlPtsY[-3]+ctlPtsY[-2])/2
    B_x,B_y=quadraticBezier(t,[[midX,midY], [ctlPtsX[-2], ctlPtsY[-2]], [ctlPtsX[-1], ctlPtsY[-1]]])
    bezierX = np.concatenate((bezierX, B_x))
    bezierY = np.concatenate((bezierY, B_y)) 

    bezierX = np.concatenate((bezierX, [ctlPtsX[-1]]))
    bezierY = np.concatenate((bezierY, [ctlPtsY[-1]])) 



    return bezierX, bezierY



app = Flask(__name__)

# set the project root directory as the static folder, you can set others.
@app.route('/')
@app.route('/index.html')
def index():
    return render_template('index.html')
@app.route('/quadBezier.html')
def quadBezier():
    return render_template('quadBezier.html')

@app.route('/hello')
def hello():
    x = request.args.get('x')
    y = request.args.get('y')
    Re = float(request.args.get('Re'))
    M = float(request.args.get('M'))
    Alpha = float(request.args.get('Alpha'))
    x = x.split()
    y = y.split()
    ctrlX = [float(ele) for ele in x]
    ctrlY = [float(ele) for ele in y]
    bezierX, bezierY = airfoil(ctrlX, ctrlY, 16)

    xf = XFoil()
    xf.Re = Re
    xf.M = 0
    xf.max_iter = 100
    xf.airfoil = Airfoil(np.array(bezierX), np.array(bezierY))
    aero = xf.a(Alpha)
    xcp, cp = xf.get_cp_distribution()
    y = savgol_filter(cp, 5, 2)
    for i in range(30):
        y = savgol_filter(y, 5, 2)
    LD = aero[0]/aero[1]
    vol = PolyArea(bezierX, bezierY)

    print(len(xcp))

    return jsonify(result = str(round(aero[0],3))+ " " + str(round(aero[1],3))+ " " + str(round(aero[2],3))+ " " + str(round(LD,2)) + " " + str(round(vol,3)), xcp = xcp.tolist(), cp = y.tolist())

@app.route('/xfoil')
def xfoil():
    x = request.args.get('x')
    y = request.args.get('y')
    Re = float(request.args.get('Re'))
    M = float(request.args.get('M'))
    Alpha = float(request.args.get('Alpha'))
    x = x.split()
    y = y.split()
    ctrlX = [float(ele) for ele in x]
    ctrlY = [float(ele) for ele in y]
    #bezierX, bezierY = airfoil(ctrlX, ctrlY, 16)

    xf = XFoil()
    xf.airfoil = Airfoil(np.array(ctrlX), np.array(ctrlY))
    xf.repanel()

    xf.Re = Re
    xf.M = 0
    xf.max_iter = 100
    
    
    aero = xf.a(Alpha)
    xcp, cp = xf.get_cp_distribution()
    y = savgol_filter(cp, 5, 2)
    for i in range(30):
        y = savgol_filter(y, 5, 2)
    LD = aero[0]/aero[1]
    vol = PolyArea(ctrlX, ctrlY)


    return jsonify(result = str(round(aero[0],3))+ " " + str(round(aero[1],3))+ " " + str(round(aero[2],3))+ " " + str(round(LD,2)) + " " + str(round(vol,3)), xcp = xcp.tolist(), cp = y.tolist())






if __name__ == "__main__":
    app.run()


