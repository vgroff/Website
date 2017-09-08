import matplotlib.pyplot as plt

xDat = range(20)
yDat = []
y = 1
a = 0.7
for x in xDat:
	yDat.append(y)
	y *= a

fig, ax = plt.subplots()
#ax = fig.add_subplot(111)
ax.plot(xDat, yDat)
ax.set_ylim(0, ax.get_ylim()[1])
plt.show()
