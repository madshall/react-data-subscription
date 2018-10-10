echo "Expecting: 200"
curl -v --header "Content-Type: application/json" --request POST --data '{"name": "xyz","value":123}' 'http://localhost:3001/ping'
echo "\n"
echo "Expecting: 200"
curl -v 'http://localhost:3001/ping?name=xyz&value=123'
echo "\n"
echo "Expecting: 404"
curl -v 'http://localhost:3001/unknown?name=xyz&value=123'
echo "\n"
echo "Expecting: 405"
curl -v -X PUT 'http://localhost:3001/ping?name=xyz&value=123'
echo "\n"
