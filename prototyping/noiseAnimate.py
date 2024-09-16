import numpy as np
import opensimplex
import plotly.graph_objects as go

xSize = 50
ySize = 50
spacing = 0.5
step = 0.2

Z = []

# Generate noise values for each frame
for i in range(50):
    print(i)
    x = np.arange(0, xSize, spacing)
    y = np.arange(0, ySize, spacing) + step * i
    z = opensimplex.noise2array(x, y)
    Z.append(z)

# Create figure
fig = go.Figure()

# Add the first frame's heatmap (initial frame)
fig.add_trace(go.Heatmap(z=Z[0], colorscale='hot'))

# Create frames for the animation
frames = [go.Frame(data=[go.Heatmap(z=Z[i], colorscale='hot')], name=f'frame{i+1}') for i in range(len(Z))]

# Update layout with sliders and animation settings
fig.update_layout(
    title='Z Imshows',
    sliders=[{
        'active': 0,
        'yanchor': 'top',
        'xanchor': 'left',
        'currentvalue': {
            'font': {'size': 20},
            'prefix': 'Frame:',
            'visible': True,
            'xanchor': 'right'
        },
        'transition': {'duration': 500, 'easing': 'linear'},
        'pad': {'b': 10, 't': 50},
        'len': 0.9,
        'x': 0.1,
        'y': 0,
        'steps': [
            {
                'args': [[f'frame{i+1}'], {'frame': {'duration': 500, 'redraw': True}, 'mode': 'immediate', 'transition': {'duration': 0}}],
                'label': i+1,
                'method': 'animate'
            }
            for i in range(len(Z))
        ]
    }],
    updatemenus=[{
        'type': 'buttons',
        'showactive': False,
        'buttons': [{
            'label': 'Play',
            'method': 'animate',
            'args': [None, {'frame': {'duration': 500, 'redraw': True}, 'fromcurrent': True, 'mode': 'immediate'}]
        }, {
            'label': 'Pause',
            'method': 'animate',
            'args': [[None], {'frame': {'duration': 0, 'redraw': False}, 'mode': 'immediate'}]
        }]
    }]
)

# Add frames to the figure
fig.frames = frames

# Ensure axes scaling remains consistent
fig.update_xaxes(scaleanchor="y", scaleratio=1)
fig.update_yaxes(scaleanchor="x", scaleratio=1)

# Show figure
fig.show()
