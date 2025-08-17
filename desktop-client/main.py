import requests
import json
import random
import datetime

# Next.js 应用程序中 API 端点的 URL
# 确保您的 Next.js 应用程序正在运行并且可以从此 URL 访问
# 如果您在本地使用 `npm run dev` 运行 Next.js 应用程序，它很可能在端口 9002 上。
API_URL = "http://localhost:9002/api/data"

def generate_random_data_entry():
    """生成单个随机数据条目。"""
    device_num = random.randint(1, 5)
    unit_num = (device_num + 1) // 2
    
    # 在过去 90 天内生成一个随机时间戳
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=90)
    random_date = start_date + (end_date - start_date) * random.random()
    
    data_entry = {
        "timestamp": random_date.isoformat(),
        "deviceId": f"DEV-{str(device_num).zfill(3)}",
        "sourceUnit": f"Unit-{chr(64 + unit_num)}",
        "animalId": f"ANI-{str(random.randint(1, 50)).zfill(4)}",
        "animalWeight": round(random.uniform(5.0, 200.0), 2)
    }
    return data_entry

def send_data_to_server(data_entry):
    """通过 POST 请求将数据条目发送到服务器。"""
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(API_URL, data=json.dumps(data_entry), headers=headers)
        
        # 检查请求是否成功
        if response.status_code == 201:
            print("数据发送成功！")
            print("响应:", response.json())
        else:
            print(f"发送数据失败。状态码: {response.status_code}")
            print("响应:", response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"发送请求时发生错误: {e}")

if __name__ == "__main__":
    print("正在生成用于测试的随机数据记录...")
    test_data = generate_random_data_entry()
    print("\n生成的数据:")
    print(json.dumps(test_data, indent=2))
    
    print(f"\n正在向 {API_URL} 发送数据...")
    send_data_to_server(test_data)
