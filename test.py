import matplotlib.pyplot as plt 
import numpy as np 
from scipy.signal import savgol_filter

xcp = np.load('xcp.npy')
cp = np.load('cp.npy')

y = savgol_filter(cp, 5, 2)
for i in range(30):
	y = savgol_filter(y, 5, 2)

plt.plot(xcp, y)
plt.show()
