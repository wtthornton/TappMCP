
        export function complexFunction(data: any[]): any[] {
          const results = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i]) {
              if (typeof data[i] === 'object') {
                for (const key in data[i]) {
                  if (data[i].hasOwnProperty(key)) {
                    switch (typeof data[i][key]) {
                      case 'string':
                        if (data[i][key].length > 10) {
                          results.push(data[i][key].toUpperCase());
                        } else {
                          results.push(data[i][key]);
                        }
                        break;
                      case 'number':
                        if (data[i][key] > 100 && data[i][key] < 1000 || data[i][key] === 0) {
                          results.push(data[i][key] * 2);
                        }
                        break;
                    }
                  }
                }
              }
            }
          }
          return results;
        }
