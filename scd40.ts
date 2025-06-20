/**
 * SCD40 CO₂ Sensor driver for micro:bit
 */
//% weight=100 color=#00C0EF icon="\uf042"
namespace scd40 {
    const SCD40_ADDR = 0x62;

    function crc8(data: number[]): number {
        let crc = 0xFF;
        const POLY = 0x31;
        for (let b of data) {
            crc ^= b;
            for (let i = 0; i < 8; i++) {
                if ((crc & 0x80) !== 0) {
                    crc = ((crc << 1) ^ POLY) & 0xFF;
                } else {
                    crc = (crc << 1) & 0xFF;
                }
            }
        }
        return crc;
    }

    /**
     * Start periodic measurement on the SCD40.
     */
    //% block="start SCD40 CO₂ måling"
    //% weight=100
    export function startMeasurement(): void {
        // Kommando: Start periodic measurement 0x21B1
        pins.i2cWriteNumber(SCD40_ADDR, 0x21B1, NumberFormat.UInt16BE);
        basic.pause(500);
    }

    /**
     * Read CO₂ concentration in ppm from SCD40.
     */
    //% block="les CO₂ (ppm)"
    //% weight=90
    export function readCO2(): number {
        pins.i2cWriteNumber(SCD40_ADDR, 0xEC05, NumberFormat.UInt16BE);
        const buf = pins.i2cReadBuffer(SCD40_ADDR, 9);
        const co2Raw = (buf[0] << 8) | buf[1];
        if (crc8([buf[0], buf[1]]) != buf[2]) return -1;
        return co2Raw;
    }

    /**
     * Read temperature in °C from SCD40.
     */
    //% block="les temperatur (°C)"
    //% weight=80
    export function readTemperature(): number {
        pins.i2cWriteNumber(SCD40_ADDR, 0xEC05, NumberFormat.UInt16BE);
        const buf = pins.i2cReadBuffer(SCD40_ADDR, 9);
        const raw = (buf[3] << 8) | buf[4];
        if (crc8([buf[3], buf[4]]) != buf[5]) return NaN;
        return -45 + 175 * raw / 65536;
    }

    /**
     * Read humidity in % from SCD40.
     */
    //% block="les luftfuktighet (%)"
    //% weight=70
    export function readHumidity(): number {
        pins.i2cWriteNumber(SCD40_ADDR, 0xEC05, NumberFormat.UInt16BE);
        const buf = pins.i2cReadBuffer(SCD40_ADDR, 9);
        const raw = (buf[6] << 8) | buf[7];
        if (crc8([buf[6], buf[7]]) != buf[8]) return NaN;
        return 100 * raw / 65536;
    }
}
