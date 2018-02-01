from __future__ import division
import matplotlib.pyplot as plt

def findMax(f, start, end, stepSize, minChange):
    x = start
    y2 = f(x)
    grad = 1
    x += grad*stepSize
    while(True):
        y = f(x)
        grad = (y - y2) / (grad*stepSize)
        x += grad*stepSize
        print x, y, y2
        if (x < start):
            x = start
            break
        elif (x > end):
            x = end
            break
        elif (abs(y - y2) < minChange):
            print "change too small"
            break
        y2 = y
    return x

def xToY(x,costx,costy,money):
    y = (money - costx*x) / costy
    if (y > 1-x):
        y = 1 - x
    if (y < 0):
        return 0
    return y
    

def findMaxSatisfaction(f,costx,costy,money,normalize=True):
    z_max = 1
    if normalize == True:
        z_max = findMaxSatisfaction(f, costx, costy, max(costx, costy), False)[1]
    stepSize = 0.2
    minChange = 0.001
    grad = 1
    x = 0
    y = xToY(x, costx, costy, money)
    z2 = f(x,y)/z_max
    if (normalize == True and z > 1):
        z = 1
    xStep = grad*stepSize
    x += xStep
    y = xToY(x, costx, costy, money)
    while(True):
        z = f(x,y)/z_max
        if (normalize == True and z > 1):
            z = 1
        if (z > z2):
            # If function is still increasing, continue along this path
            grad = (z - z2) / (xStep)
            xStep = grad*stepSize
            x += xStep
            y = xToY(x, costx, costy, money)
            #print x*costx, money
            print x, y, z
            if (x < 0):
                x = 0
                break
            elif (x > 1):
                x = 1
                break
            elif (x*costx > money):
                x = money/costx
                break
            elif (abs(z - z2) < minChange):
                print "change too small"
                break
        else:
            # If function is now decreasing, we have jumped too far, and
            # Need to binary search the maximum
            #x -= grad*stepSize
            maxIter = 10
            i = 0
            #xStep = grad*stepSize / 2
            #x += xStep
            #y = xToY(x)
            #z = f(x,y)
            # This wont work if it jumps over the maximum to another place higher than itself
            # since it wont be "too far", even though it is.
            # Need to search in both directions each time, and pick whichever is larger to continue with
            tooFar = True
            while (abs(z-z2) > minChange and i < maxIter):
                xStep = xStep/2
                if tooFar == True:
                    x -= xStep
                    y = xToY(x)
                    z = f(x,y)
                    if (z < z2):
                        tooFar = True
                    else :
                        tooFar = False
                else:
                    
                i++
        z2 = z
    return [x, z]

def satisfaction(x, y):
    strengthX = 0.6
    strengthY = 1 - strengthX
    #print "satisfaction:", (x+y)**0.8, strengthX*(x/strengthX)**0.8, strengthY*(y/strengthY)**0.6
    satisfaction = (x+y)**0.8*(strengthX*(x/strengthX)**0.8 + strengthY*(y/strengthY)**0.6)
    #satisfaction = satisfaction / 1.02
    #if satisfaction > 1:
    #    satisfaction = 1
    return satisfaction
    
def square(x):
    return x**2

def square2(x):
    return (x-0.5)**2

def happiness(x):
    return (0.6*x**0.8 + 0.4*(1-x)**0.6)

#maximum = findMax(happiness, 0, 1, 0.3, 0.0005)
#print maximum

#findDomain(1,3,1)
#findMaxSatisfaction(satisfaction, 5, 2, 5)

plt.figure()
ax = plt.subplot(111)
step = 0.01
steps = int(1/step) + 1
listX = []
listZ = []
costx = 5
costy = 2
money = 3
z_max = findMaxSatisfaction(satisfaction, costx, costy, max(costx, costy), False)[1]
print z_max
for x in [step*i for i in range(steps)]:
    if (x*costx <= money):
        y = xToY(x,costx,costy,money)
        z = satisfaction(x,y)/z_max
        if (z > 1):
            z = 1
        listX.append(x)
        listZ.append(z)
        #print x,y,z
plt.plot(listX,listZ)
print "TESTING"
print findMaxSatisfaction(satisfaction, costx, costy, money)
plt.show()


#class Satisfaction():
#    def __init__(self, ):

# Satisfaction equation is weird - doesnt work properly
# Wondering if we dont need to cap the benefits of either at 1
# why do wee need (x+y) in front? to make sure we have a total of 1?
# Given that we have 2 numbers that always sum to 1, how can we map
# them onto another number that maps between 0 and 1 nicely?
# Using x+y seems intelligent, but we do also need to gather the "variety" idea
# Could that be an x*y? At maximum it would be 0.25, but it doesnt asses any relative
# strengths of either product. Could fudge it like this for now. Could do a sum of both?
# Could create a satisfaction class, which computes and saves it's own maximum for later use,
# doing z(x,y)/z_max to noramlize it to 1

# Satisfaction tree - each satisfaction is a binary optimizer twice-fold,
# e.g. the first node is food and it is split between how much it spends
# on e.g. low quality food versus high quality food (first binary optimization)
# and how much it spends on food versus everything else, the idea being
# that it first tries to spend as much as is sensible (or possible) on food,
# and then tries spending a little less, until a maximum is found.
# The same is true for housing, and some other basic needs, clothing, hygiene, healthcare.
# Then the "luxury" needs are piled in together, all having linear values for now.
# Or maybe they have smaller step size, like only 0,0.5,1
# Remember we will also introduce variety to spending by calculating overall happiness
# as elasticity*mod(currentHappiness - todayHappiness), allowing for some preferences
# to kick in irregularly
# For things like hygiene, could even pick between 3 choices depending on what gives best
# value for money, what do I exactly mean by this?

# Need to beef up the max function so that it doesnt get caught in any loops
# Check if we have already got a larger value than the one we are atm currently - if so,
# go back a step, then take a step that is half the size, and do a binary serach type thing to
# find max
