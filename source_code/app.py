from sklearn.preprocessing import StandardScaler, MinMaxScaler
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.manifold import MDS
from scipy import stats
import pandas as pd
import numpy as np
import os
import geojson

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['JSON_SORT_KEYS'] = False
curr_dir = os.path.dirname(__file__)

mf_suicide_df = pd.read_csv('Datasets/mf_suicide_cleaned.csv')
suicide_rate_df = pd.read_csv('Datasets/suicide_rates_cleaned.csv')
pcp_df = pd.read_csv('Datasets/pcp_cleaned.csv')
stacked_bar_chart = pd.read_csv('Datasets/age_cleaned.csv')
scatter_chart = stacked_bar_chart
stacked_bar_chart_new = pd.read_csv('Datasets/stacked_bar_chart_new.csv')
stacked_bar_chart_new_temp = stacked_bar_chart_new
geo_path = os.path.join(curr_dir, os.path.join('Datasets', 'countries.json'))

with open(geo_path) as f:
    gj = geojson.load(f)
    for i in range(len(gj["features"])):
        if(gj["features"][i]["properties"]["name"] == "Antarctica"):
            gj["features"].remove(gj["features"][i])
            break

# Geo features for plotting world map
geo_features = gj['features']

#print(pcp_df_numerical)
def generate_MDS(pcp_df_numerical):
    embedding = MDS(n_components=2)
    df_transformed = embedding.fit_transform(pcp_df_numerical)
    #print(df_transformed)
    return df_transformed

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/getChoropleth', methods=['POST','GET'])
#@cross_origin(origin='localhost', headers=['Content- Type', 'Authorization'])
def getChoropleth():
    if(request.method == 'POST'):
        dates = request.get_json()
        print(dates)
        #start_date = pd.to_datetime(dates["start"])
        #end_date = pd.to_datetime(dates["end"])
    else:
        dates = {'start': 1990, 'end': 2017}      
    filtered_data = suicide_rate_df.loc[(suicide_rate_df.Year>=dates['start']) & (suicide_rate_df.Year<=dates['end'])]
   
    groupby_data = filtered_data.groupby(["Code"])
    
    mean_deaths = groupby_data.Deaths.mean()*10000000
        
    for i in range(len(gj["features"])):
        id = gj["features"][i]["id"]
        
        if(id in filtered_data["Code"].values):
            
            gj["features"][i]["Deaths"] = int(mean_deaths[id])

    return gj

@app.route('/getScatterPlot', methods=["POST" , "GET"])
def getScatterPlot():
    
    if(request.method == 'POST'):
        code = [request.get_json()]
    else:
        code = ['OWID_WRL']

    scatter_chart = stacked_bar_chart[['Entity','Age5to14', 'Age15to49','Age50to69','Age70']]
    scatter_chart = scatter_chart.groupby('Entity').sum().reset_index()
    
    scatter_chart['pop'] = scatter_chart['Age5to14'] + scatter_chart['Age15to49'] + scatter_chart['Age50to69']+ scatter_chart['Age70'] 
    temp = scatter_chart[['Entity','pop']]

    cols = ['Entity', 'Code','Male_suicide_rate','Female_suicide_rate']
    mf_suicide_df_temp = mf_suicide_df[cols]
    mf_suicide_df_temp = mf_suicide_df_temp.groupby(['Entity'] ,  as_index= False).mean()#.sort_values(by='Male_suicide_rate', ascending =False)
    
    mf_suicide_df_temp = pd.merge(temp , mf_suicide_df_temp, on=['Entity'], how='left')   
    mf_suicide_df_temp = mf_suicide_df_temp.dropna()
    mf_suicide_df_temp = mf_suicide_df_temp[mf_suicide_df_temp.Entity != 'World']
    mf_suicide_df_temp = mf_suicide_df_temp[mf_suicide_df_temp.Entity != 'Greenland']
 
    
    mf_suicide_df_dict = mf_suicide_df_temp.to_dict('records')
    return jsonify(mf_suicide_df_dict)

@app.route('/getLinePlot', methods=["POST" , "GET"])
#@cross_origin(origin='localhost', headers=['Content- Type', 'Authorization'])
def getLinePlot():

    code =['OWID_WRL'] 
    
    if(request.method == 'POST'):
        code.append(request.get_json())

    else:
        code = ['RUS','IND','USA','OWID_WRL','CHN'] #,'DEU','FRA','KOR','UKR']
    
    
    mf_suicide_df_temp = mf_suicide_df[['Entity', 'Code','Year','Male_suicide_rate','Female_suicide_rate']]
    mf_suicide_df_temp = mf_suicide_df_temp.loc[mf_suicide_df_temp['Code'].isin(code)]

    mf_suicide_df_dict = mf_suicide_df_temp.to_dict('records')

    return jsonify(mf_suicide_df_dict)

@app.route('/getKmeansPCP', methods=["POST" , "GET"])
#@cross_origin(origin='localhost', headers=['Content- Type', 'Authorization'])
def getKmeansPCP():
    code = []
    pcp_df_temp = pcp_df
    clusters = 4
    if(request.method == 'POST'):
        code.append(request.get_json())
        pcp_df_temp = pcp_df_temp.loc[pcp_df_temp['Code'].isin(code)]
        clusters = 3

    categorical_cols = ['Entity','Code']
    pcp_df_temp = pcp_df_temp.drop(categorical_cols, axis = 1)
    pcp_df_temp = pcp_df_temp.head(200)
    result =  generate_MDS(pcp_df_temp)
    df_kpcp = pd.DataFrame(result, columns=['Component1', 'Component2'])
    kmeans = KMeans(n_clusters=clusters, random_state=0)
    kmeans_data = kmeans.fit(df_kpcp)
    kmeans_label = kmeans_data.labels_
    #print("hello")
    return jsonify(kmeans_label.tolist())
   
@app.route('/getPCPPlot', methods=["POST" , "GET"])
def getPCPPlot():
    pcp_df_temp = pcp_df
    cols= ['Year','Population','Depression','Suicide_depression','Violence', 'Suicide_violence', 'Homicide','Suicide_homicide']
    code = []
    if(request.method == 'POST'):
        code.append(request.get_json())
        pcp_df_temp = pcp_df_temp.loc[pcp_df_temp['Code'].isin(code)]
   
    pcp_df_dict = pcp_df_temp[cols].to_dict('records')
    return jsonify(pcp_df_dict)

@app.route('/getBarPlot', methods=["POST" , "GET"])
#@cross_origin(origin='localhost', headers=['Content- Type', 'Authorization'])
def getBarPlot():    
    if(request.method == 'POST'):
        code = request.get_json()
    else:
        code = 'OWID_WRL'

    stacked_bar_chart_temp = stacked_bar_chart_new_temp[['Entity','Code','Year','Age5to14', 'Age15to49','Age50to69','Age70']]
    stacked_bar_chart_temp = stacked_bar_chart_temp[stacked_bar_chart_temp['Code'] == code]
    stacked_bar_chart_dict = stacked_bar_chart_temp[['Year','Age5to14', 'Age15to49','Age50to69','Age70']].to_dict('records')
    return jsonify(stacked_bar_chart_dict)

def run_init():
    app.config['SECRET_KEY'] = 'somethingsecret'
    app.config['CORS_HEADERS'] = 'Content-Type'
    cors = CORS(app, resources={r"/foo": {"origins": "http://localhost:port"}})

if __name__ == '__main__':
   app.run(debug=True)
   run_init()