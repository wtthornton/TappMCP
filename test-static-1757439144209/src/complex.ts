
        export function processData(input: any): any {
          if (input) {
            if (typeof input === 'object') {
              for (const key in input) {
                if (input.hasOwnProperty(key)) {
                  switch (typeof input[key]) {
                    case 'string':
                      if (input[key].length > 0 && input[key].length < 100 || input[key] === 'special') {
                        return input[key].toUpperCase();
                      }
                      break;
                    case 'number':
                      if (input[key] > 0) {
                        for (let i = 0; i < input[key]; i++) {
                          if (i % 2 === 0 && i > 5 || i === 1) {
                            console.log(i);
                          }
                        }
                      }
                      break;
                  }
                }
              }
            }
          }
          return null;
        }
